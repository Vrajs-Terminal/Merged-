import express from 'express';
import prisma from '../../lib/prismaClient';
import { logActivity } from '../../services/activityLogger';

const router = express.Router();

// GET / - List all custom earnings/deductions for an employee
router.get('/', async (req, res) => {
    try {
        const { user_id, month, year } = req.query;
        const where: any = {};
        if (user_id) where.user_id = parseInt(user_id as string);
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);

        const records = await prisma.otherEarningDeduction.findMany({
            where,
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(records);
    } catch (error: any) {
        console.error("Fetch Other Earnings Error:", error);
        res.status(500).json({ error: "Failed to fetch records", details: error.message });
    }
});

// POST / - Add new custom earning/deduction
router.post('/', async (req, res) => {
    try {
        const { user_id, name, type, amount, percentage, description, month, year, is_recurring } = req.body;
        
        if (!user_id || !name || !type || !amount || !month || !year) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const record = await prisma.otherEarningDeduction.create({
            data: {
                user_id: parseInt(user_id),
                name,
                type,
                amount: parseFloat(amount),
                percentage: (percentage && percentage !== "") ? parseFloat(percentage) : null,
                description,
                month: parseInt(month),
                year: parseInt(year),
                is_recurring: !!is_recurring
            }
        });

        await logActivity((req as any).user?.id || null, 'ADDED', 'OTHER_EARNING_DEDUCTION', `User ID: ${user_id}, ${name}: ${amount}`);
        res.status(201).json(record);
    } catch (error: any) {
        console.error("Create Other Earning Error:", error);
        res.status(500).json({ error: "Failed to create record", details: error.message });
    }
});

// PUT /:id - Update entry
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, amount, percentage, description, month, year, is_recurring, status } = req.body;

        const record = await prisma.otherEarningDeduction.update({
            where: { id: parseInt(id) },
            data: {
                name,
                type,
                amount: amount ? parseFloat(amount) : undefined,
                percentage: percentage !== undefined ? parseFloat(percentage) : undefined,
                description,
                month: month ? parseInt(month) : undefined,
                year: year ? parseInt(year) : undefined,
                is_recurring: is_recurring !== undefined ? !!is_recurring : undefined,
                status
            }
        });

        await logActivity(null, 'UPDATED', 'OTHER_EARNING_DEDUCTION', `ID: ${id}`);
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: "Failed to update record" });
    }
});

// DELETE /:id - Delete entry
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.otherEarningDeduction.delete({ where: { id: parseInt(id) } });
        await logActivity(null, 'DELETED', 'OTHER_EARNING_DEDUCTION', `ID: ${id}`);
        res.json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete record" });
    }
});

export default router;
