import express from 'express';
import prisma from '../../lib/prismaClient';
import { logActivity } from '../../services/activityLogger';

const router = express.Router();

// GET / - List incentives with filters
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, user_id, month, year, status, incentive_type_id } = req.query;
        
        const where: any = {};
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);
        if (status) where.status = status as string;
        if (incentive_type_id) where.incentive_type_id = parseInt(incentive_type_id as string);
        if (user_id) where.user_id = parseInt(user_id as string);

        if (branch_id || department_id) {
            where.user = {};
            if (branch_id) where.user.branch_id = parseInt(branch_id as string);
            if (department_id) where.user.department_id = parseInt(department_id as string);
        }

        const records = await prisma.employeeIncentiveDetail.findMany({
            where,
            include: {
                user: { 
                    select: { 
                        name: true, 
                        branch: { select: { name: true } }, 
                        department: { select: { name: true } } 
                    } 
                },
                incentiveType: true,
                addedBy: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(records);
    } catch (error: any) {
        console.error("Fetch Incentives Error:", error);
        res.status(500).json({ error: "Failed to fetch incentives", details: error.message });
    }
});

// POST / - Add new incentive
router.post('/', async (req, res) => {
    try {
        const { user_id, incentive_type_id, amount, description, month, year, status } = req.body;
        
        if (!user_id || !incentive_type_id || !amount || !month || !year) {
            return res.status(400).json({ error: "Missing required fields (User, Type, Amount, Month, Year)" });
        }

        const record = await prisma.employeeIncentiveDetail.create({
            data: {
                user_id: parseInt(user_id),
                incentive_type_id: parseInt(incentive_type_id),
                amount: parseFloat(amount),
                description,
                month: parseInt(month),
                year: parseInt(year),
                status: status || 'Pending',
                added_by: (req as any).user?.id || 1 
            }
        });

        await logActivity((req as any).user?.id || null, 'ADDED', 'EMPLOYEE_INCENTIVE', `User ID: ${user_id}, Amount: ${amount}`);
        res.status(201).json(record);
    } catch (error: any) {
        console.error("Create Incentive Error:", error);
        res.status(500).json({ error: "Failed to create incentive", details: error.message });
    }
});

// PATCH /:id/status - Approve or Reject
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approved_by } = req.body;

        const record = await prisma.employeeIncentiveDetail.update({
            where: { id: parseInt(id) },
            data: { 
                status, 
                approved_by: status === 'Approved' ? (approved_by || 1) : null,
                approved_at: status === 'Approved' ? new Date() : null
            }
        });

        await logActivity(null, 'STATUS_UPDATED', 'EMPLOYEE_INCENTIVE', `ID: ${id}, Status: ${status}`);
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

// DELETE /:id - Delete incentive
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const record = await prisma.employeeIncentiveDetail.findUnique({ where: { id: parseInt(id) } });
        if (record?.status === 'Paid') {
            return res.status(400).json({ error: "Cannot delete an incentive that has already been paid" });
        }

        await prisma.employeeIncentiveDetail.delete({ where: { id: parseInt(id) } });
        await logActivity(null, 'DELETED', 'EMPLOYEE_INCENTIVE', `ID: ${id}`);
        res.json({ message: "Incentive deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete incentive" });
    }
});

export default router;
