import { Router, Request, Response } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// Get Other Incomes / Losses
router.get('/', async (req: Request, res: Response) => {
    try {
        const { financial_year, user_id, type } = req.query;
        let where: any = {};
        
        if (financial_year) where.financial_year = String(financial_year);
        if (user_id) where.user_id = parseInt(String(user_id));
        if (type) where.type = String(type);

        const records = await prisma.otherIncomeLoss.findMany({
            where,
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(records);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch records.' });
    }
});

// Add a new entry
router.post('/', async (req: Request, res: Response) => {
    try {
        const { user_id, financial_year, type, source, amount, description, proof_url } = req.body;
        
        if (!user_id || !financial_year || !type || !source || amount === undefined) {
            return res.status(400).json({ error: 'Missing req details' });
        }

        if (amount < 0) {
            return res.status(400).json({ error: 'Amount cannot be negative.' });
        }

        const entry = await prisma.otherIncomeLoss.create({
            data: {
                user_id,
                financial_year,
                type,
                source,
                amount,
                description,
                proof_url,
                status: 'Approved' // Auto-approve for HR entries
            }
        });
        
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to add record.' });
    }
});

// Update Entry
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { type, source, amount, description, proof_url, status } = req.body;

        if (amount !== undefined && amount < 0) {
            return res.status(400).json({ error: 'Amount cannot be negative.' });
        }

        const updated = await prisma.otherIncomeLoss.update({
            where: { id },
            data: { type, source, amount, description, proof_url, status }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update record.' });
    }
});

// Delete Entry
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.otherIncomeLoss.delete({ where: { id } });
        res.json({ message: 'Record deleted successfully.' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete record.' });
    }
});

export default router;
