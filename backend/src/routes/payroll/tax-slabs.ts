import { Router, Request, Response } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// Get configured slabs
router.get('/', async (req: Request, res: Response) => {
    try {
        const { financial_year, tax_regime, slab_type } = req.query;
        let where: any = {};
        
        if (financial_year) where.financial_year = financial_year as string;
        if (tax_regime) where.tax_regime = tax_regime as string;
        if (slab_type) where.slab_type = slab_type as string;

        const slabs = await prisma.incomeTaxSlab.findMany({
            where,
            orderBy: { from_amount: 'asc' }
        });
        
        res.json(slabs);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch income tax slabs' });
    }
});

// Create multiple slabs at once (Bulk override for a specific regime + type + fy)
router.post('/bulk', async (req: Request, res: Response) => {
    try {
        const { financial_year, tax_regime, slab_type, slabs } = req.body;
        
        if (!financial_year || !tax_regime || !slab_type || !slabs || !Array.isArray(slabs)) {
            return res.status(400).json({ error: 'Missing required configuration parameters.' });
        }

        // Validate overlap securely
        let currentAmount = 0;
        for (let i = 0; i < slabs.length; i++) {
            const slab = slabs[i];
            if (slab.from_amount !== currentAmount) {
                return res.status(400).json({ error: `Gap or overlap found at from_amount: ${slab.from_amount}` });
            }
            if (slab.to_amount !== null && slab.to_amount <= slab.from_amount) {
                return res.status(400).json({ error: 'to_amount must be greater than from_amount' });
            }
            if (i === slabs.length - 1 && slab.to_amount !== null) {
                return res.status(400).json({ error: 'Final slab must have a null to_amount (Above)' });
            }
            if (slab.to_amount !== null) {
                currentAmount = slab.to_amount;
            }
        }

        // Delete existing slabs for this configuration before replacing with new ones
        const createdSlabs = await prisma.$transaction(async (tx: any) => {
            await tx.incomeTaxSlab.deleteMany({
                where: { financial_year, tax_regime, slab_type, is_locked: false }
            });

            return Promise.all(slabs.map((slab: any) => 
                tx.incomeTaxSlab.create({
                    data: {
                        financial_year,
                        tax_regime,
                        slab_type,
                        from_amount: slab.from_amount,
                        to_amount: slab.to_amount,
                        tax_percentage: slab.tax_percentage,
                        status: slab.status || 'Active'
                    }
                })
            ));
        });

        res.json(createdSlabs);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save income tax slabs' });
    }
});

// Delete a slab
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const slab = await prisma.incomeTaxSlab.findUnique({ where: { id } });
        
        if (!slab) return res.status(404).json({ error: 'Slab not found' });
        if (slab.is_locked) return res.status(400).json({ error: 'Cannot delete locked slabs.' });
        
        await prisma.incomeTaxSlab.delete({ where: { id } });
        
        res.json({ message: 'Slab deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete income tax slab' });
    }
});

export default router;
