import express from 'express';
import prisma from '../../lib/prismaClient';
import { logActivity } from '../../services/activityLogger';

const router = express.Router();

// GET / — List all current employee CTCs with filters
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, search } = req.query;

        const where: any = {
            status: 'Current'
        };

        if (branch_id) where.user = { ...where.user, branch_id: parseInt(branch_id as string) };
        if (department_id) where.user = { ...where.user, department_id: parseInt(department_id as string) };
        if (search) {
            where.user = {
                ...where.user,
                OR: [
                    { name: { contains: search as string } },
                    { email: { contains: search as string } }
                ]
            };
        }

        const ctcs = await prisma.employeeCTC.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        branch: { select: { name: true } },
                        department: { select: { name: true } }
                    }
                },
                salaryGroup: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(ctcs);
    } catch (error) {
        console.error("Error fetching employee CTCs:", error);
        res.status(500).json({ error: "Failed to fetch employee CTCs" });
    }
});

// GET /users-list — List employees for dropdown (those without current CTC or all active)
router.get('/users-list', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: { not: 'Superadmin' } },
            select: { id: true, name: true, email: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// POST / — Assign new CTC (marks previous as "Previous")
router.post('/', async (req, res) => {
    try {
        const { user_id, salary_group_id, salary_type, gross_salary, increment_remark, start_date, next_increment_date } = req.body;

        if (!user_id || !salary_group_id || !gross_salary || !start_date) {
            return res.status(400).json({ error: "Required fields are missing" });
        }

        // Use transaction to update old and create new
        const result = await prisma.$transaction(async (tx: any) => {
            // Mark existing CTC as 'Previous'
            await tx.employeeCTC.updateMany({
                where: { user_id: parseInt(user_id), status: 'Current' },
                data: { status: 'Previous' }
            });

            // Create new CTC
            return tx.employeeCTC.create({
                data: {
                    user_id: parseInt(user_id),
                    salary_group_id: parseInt(salary_group_id),
                    salary_type,
                    gross_salary: parseFloat(gross_salary),
                    increment_remark,
                    start_date: new Date(start_date),
                    next_increment_date: next_increment_date ? new Date(next_increment_date) : null,
                    status: 'Current'
                }
            });
        });

        await logActivity(null, 'ASSIGNED', 'CTC', `User ID: ${user_id}`);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error assigning CTC:", error);
        res.status(500).json({ error: "Failed to assign CTC" });
    }
});

// GET /history/:user_id — Get CTC history for an employee
router.get('/history/:user_id', async (req, res) => {
    try {
        const history = await prisma.employeeCTC.findMany({
            where: { user_id: parseInt(req.params.user_id) },
            include: { salaryGroup: { select: { name: true } } },
            orderBy: { start_date: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// PUT /:id — Update CTC record
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { salary_group_id, salary_type, gross_salary, increment_remark, start_date, next_increment_date, status } = req.body;

        const updated = await prisma.employeeCTC.update({
            where: { id: parseInt(id) },
            data: {
                salary_group_id: salary_group_id ? parseInt(salary_group_id) : undefined,
                salary_type,
                gross_salary: gross_salary ? parseFloat(gross_salary) : undefined,
                increment_remark,
                start_date: start_date ? new Date(start_date) : undefined,
                next_increment_date: next_increment_date ? new Date(next_increment_date) : null,
                status
            }
        });

        await logActivity(null, 'UPDATED', 'CTC', `Record ID: ${id}`);
        res.json(updated);
    } catch (error) {
        console.error("Error updating CTC:", error);
        res.status(500).json({ error: "Failed to update CTC" });
    }
});

// DELETE /:id — Delete CTC record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const target = await prisma.employeeCTC.delete({
            where: { id: parseInt(id) }
        });

        await logActivity(null, 'DELETED', 'CTC', `Record ID: ${id} for User ID: ${target.user_id}`);
        res.json({ message: "CTC record deleted successfully" });
    } catch (error) {
        console.error("Error deleting CTC:", error);
        res.status(500).json({ error: "Failed to delete CTC" });
    }
});

export default router;
