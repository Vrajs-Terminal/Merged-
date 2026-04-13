import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET employees for a specific site or all mapped employees
router.get('/', async (req, res) => {
    try {
        const { site_id, branch_id, department_id, employee_id } = req.query;

        const where: any = {};
        if (site_id) where.site_id = Number(site_id);
        if (employee_id) where.user_id = Number(employee_id);

        // Branch and department filtering requires joining the user or site relation
        if (branch_id) where.site = { branch_id: Number(branch_id) };
        if (department_id) where.site = { ...where.site, department_id: Number(department_id) };

        const employees = await prisma.siteEmployee.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, employeeGrade: { select: { name: true } }, designation: { select: { name: true } } } },
                site: { select: { id: true, name: true } },
                shift: { select: { id: true, name: true, start_time: true, end_time: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(employees);
    } catch (error) {
        console.error('Fetch site employees error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST Bulk/Single Assign employee to a site
router.post('/', async (req, res) => {
    try {
        const { site_id, user_ids, role, shift_id, join_date } = req.body;

        if (!site_id || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0 || !join_date) {
            return res.status(400).json({ message: 'Missing required configuration for assignments.' });
        }

        const addedEmployees = [];
        const skippedEmployees = [];

        for (const user_id of user_ids) {
            // Uniqueness validation (Employee can only be active on a site once)
            const existing = await prisma.siteEmployee.findUnique({
                where: { site_id_user_id: { site_id: Number(site_id), user_id: Number(user_id) } }
            });

            if (existing) {
                skippedEmployees.push(user_id);
                continue;
            }

            const emp = await prisma.siteEmployee.create({
                data: {
                    site_id: Number(site_id),
                    user_id: Number(user_id),
                    role: role || 'Worker',
                    shift_id: shift_id ? Number(shift_id) : undefined,
                    join_date: new Date(join_date),
                    status: 'Active'
                }
            });
            addedEmployees.push(emp);
        }

        res.status(201).json({ added: addedEmployees, skipped: skippedEmployees.length });

    } catch (error) {
        console.error('Assign site employee error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update employee assignment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, shift_id, exit_date, status } = req.body;

        const updated = await prisma.siteEmployee.update({
            where: { id: Number(id) },
            data: {
                role,
                shift_id: shift_id ? Number(shift_id) : null,
                exit_date: exit_date ? new Date(exit_date) : null,
                status
            }
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Update site employee error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE remove assignment totally
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.siteEmployee.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: 'Assignment Removed' });
    } catch (error) {
        console.error('Delete site employee error:', error);
        res.status(500).json({ message: 'Internal Server Error - Check if attendance data prevents deletion' });
    }
});

export default router;
