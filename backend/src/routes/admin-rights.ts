import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = Router();

// Get all admins with their restrictions
router.get('/', async (req, res) => {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'Admin' }, // Only show admins in this scope
            include: {
                adminBranchRestrictions: { include: { branch: true } },
                adminDepartmentRestrictions: { include: { department: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin rights' });
    }
});

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            where: { role: 'Employee' }, // Fetch employees
            include: {
                adminBranchRestrictions: { include: { branch: true } },
                adminDepartmentRestrictions: { include: { department: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Update branch restrictions for an admin
router.put('/:userId/branches', async (req, res) => {
    const { userId } = req.params;
    const { branchIds, isAll } = req.body; // isAll true means bypass/delete restrictions

    try {
        // Clear existing restrictions
        await prisma.adminBranchRestriction.deleteMany({
            where: { user_id: Number(userId) }
        });

        if (!isAll && branchIds && Array.isArray(branchIds)) {
            // Apply new specific restrictions
            const data = branchIds.map(id => ({ user_id: Number(userId), branch_id: id }));
            if (data.length > 0) {
                await prisma.adminBranchRestriction.createMany({ data });
            }
        }

        const adminUser = (req as any).user;
        await logActivity(adminUser?.id || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated branch restrictions for user #${userId}`);
        res.json({ message: 'Branch restrictions updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update branch restrictions' });
    }
});

// Update department restrictions for an admin
router.put('/:userId/departments', async (req, res) => {
    const { userId } = req.params;
    const { departmentIds, isAll } = req.body;

    try {
        // Clear existing restrictions
        await prisma.adminDepartmentRestriction.deleteMany({
            where: { user_id: Number(userId) }
        });

        if (!isAll && departmentIds && Array.isArray(departmentIds)) {
            // Apply new specific restrictions
            const data = departmentIds.map(id => ({ user_id: Number(userId), department_id: id }));
            if (data.length > 0) {
                await prisma.adminDepartmentRestriction.createMany({ data });
            }
        }

        const adminUser = (req as any).user;
        await logActivity(adminUser?.id || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated department restrictions for user #${userId}`);
        res.json({ message: 'Department restrictions updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update department restrictions' });
    }
});

// Update module permissions for an admin or employee
router.put('/:userId/permissions', async (req, res) => {
    const { userId } = req.params;
    const { permissions } = req.body;

    try {
        await (prisma.user as any).update({
            where: { id: Number(userId) },
            data: { permissions }
        });
        const adminUser = (req as any).user;
        await logActivity(adminUser?.id || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated module permissions for user #${userId}`);
        res.json({ message: 'Permissions updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update module permissions' });
    }
});

// GET references (branches and departments) for the dropdown multi-select
router.get('/references', async (req, res) => {
    try {
        const branches = await prisma.branch.findMany({ select: { id: true, name: true, code: true } });
        const departments = await prisma.department.findMany({ select: { id: true, name: true, branch: { select: { name: true } } } });
        res.json({ branches, departments });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch references' });
    }
});

export default router;
