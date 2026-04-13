import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// Get all expenses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const where: any = {};

        if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
            where.user_id = user.id;
        }

        const expenses = await (prisma as any).expenseRequest.findMany({
            where,
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { amount, category, description, date } = req.body;
    const user = (req as any).user;

    try {
        const expense = await (prisma as any).expenseRequest.create({
            data: {
                user_id: user.id,
                amount: parseFloat(amount),
                category,
                description,
                date: new Date(date),
                status: 'Pending'
            }
        });
        await logActivity(user.id, 'CREATED', 'EXPENSE', category);
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.put('/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const admin = (req as any).user;

    if (admin.role !== 'Admin' && admin.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const updated = await (prisma as any).expenseRequest.update({
            where: { id: parseInt(id as string) },
            data: { status }
        });
        await logActivity(admin.id, status === 'Approved' ? 'APPROVED' : 'REJECTED', 'EXPENSE', `Expense #${id}`);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
