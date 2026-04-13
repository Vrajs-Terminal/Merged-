import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { optionalAuthenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();


// Get all departments
router.get('/', optionalAuthenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const whereClause: any = {};

        if (user && user.role === 'Admin') {
            const conditions = [];

            // If they are locked to specific branches, they can only see departments inside those branches
            if (user.restrictedBranchIds && user.restrictedBranchIds.length > 0) {
                conditions.push({ branch_id: { in: user.restrictedBranchIds } });
            }

            // If they are locked to specific departments, apply that additional filter
            if (user.restrictedDepartmentIds && user.restrictedDepartmentIds.length > 0) {
                conditions.push({ id: { in: user.restrictedDepartmentIds } });
            }

            if (conditions.length > 0) {
                // If both are present, typically it's an AND condition, or whichever is stricter
                whereClause.AND = conditions;
            }
        }

        const departments = await prisma.department.findMany({
            where: whereClause,
            orderBy: { order_index: 'asc' },
            include: { branch: true }
        });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

// Create a new department
router.post('/', async (req, res) => {
    const { name, branch_id } = req.body;

    if (!name || !branch_id) {
        return res.status(400).json({ error: 'Name and Branch ID are required' });
    }

    try {
        // Check branch exists
        const branch = await prisma.branch.findUnique({ where: { id: parseInt(branch_id) } });
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        const maxOrder = await prisma.department.aggregate({
            where: { branch_id: parseInt(branch_id) },
            _max: { order_index: true }
        });
        const nextOrder = (maxOrder._max.order_index || 0) + 1;

        const department = await prisma.department.create({
            data: {
                name,
                branch_id: parseInt(branch_id),
                order_index: nextOrder
            }
        });
        const user = (req as any).user;
        await logActivity(user?.id || null, 'CREATED', 'DEPARTMENT', department.name, { branch_id: department.branch_id });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create department' });
    }
});

// Delete a department
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = (req as any).user;
        await prisma.department.delete({ where: { id: parseInt(id) } });
        await logActivity(user?.id || null, 'DELETED', 'DEPARTMENT', `Department #${id}`);
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

export default router;
