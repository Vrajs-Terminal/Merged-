import express from 'express';
import prisma from '../../lib/prismaClient';
import { logActivity } from '../../services/activityLogger';

const router = express.Router();

// GET / - List hold requests with filters
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, employee_id, month, year, status } = req.query;
        
        const where: any = {};
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);
        if (status) where.status = status as string;
        if (employee_id) where.employee_id = parseInt(employee_id as string);

        if (branch_id || department_id) {
            where.employee = {};
            if (branch_id) where.employee.branch_id = parseInt(branch_id as string);
            if (department_id) where.employee.department_id = parseInt(department_id as string);
        }

        const records = await prisma.salaryHoldRequest.findMany({
            where,
            include: {
                employee: { 
                    select: { 
                        name: true, 
                        branch: { select: { name: true } }, 
                        department: { select: { name: true } } 
                    } 
                },
                reportingUser: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(records);
    } catch (error: any) {
        console.error("Fetch Salary Hold Requests Error:", error);
        res.status(500).json({ error: "Failed to fetch salary hold requests", details: error.message });
    }
});

// POST / - Create new hold request
router.post('/', async (req, res) => {
    try {
        const { employee_id, month, year, start_date, end_date, reason } = req.body;
        
        if (!employee_id || !month || !year || !start_date || !end_date || !reason) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const record = await prisma.salaryHoldRequest.create({
            data: {
                employee_id: parseInt(employee_id),
                reporting_user_id: (req as any).user?.id || 1, 
                month: parseInt(month),
                year: parseInt(year),
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                reason,
                status: 'Pending'
            }
        });

        await logActivity((req as any).user?.id || null, 'ADDED', 'SALARY_HOLD_REQUEST', `Employee ID: ${employee_id}, Period: ${month}/${year}`);
        res.status(201).json(record);
    } catch (error: any) {
        console.error("Create Salary Hold Request Error:", error);
        res.status(500).json({ error: "Failed to create hold request", details: error.message });
    }
});

// PATCH /:id/status - Approve, Reject, or Mark as Processed
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const record = await prisma.salaryHoldRequest.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        await logActivity(null, 'STATUS_UPDATED', 'SALARY_HOLD_REQUEST', `ID: ${id}, Status: ${status}`);
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

// DELETE /:id - Delete request
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const record = await prisma.salaryHoldRequest.findUnique({ where: { id: parseInt(id) } });
        if (record?.status === 'Processed') {
            return res.status(400).json({ error: "Cannot delete a processed hold request" });
        }

        await prisma.salaryHoldRequest.delete({ where: { id: parseInt(id) } });
        await logActivity(null, 'DELETED', 'SALARY_HOLD_REQUEST', `ID: ${id}`);
        res.json({ message: "Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete request" });
    }
});

export default router;
