import { Router, Request, Response } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// Get Form 16 Tracking Status
router.get('/', async (req: Request, res: Response) => {
    try {
        const { financial_year, status } = req.query;
        let where: any = {};
        
        if (financial_year) where.financial_year = String(financial_year);
        if (status) where.status = String(status);

        const forms = await prisma.form16Document.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, employeeCTCs: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(forms);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch Form 16 trackers.' });
    }
});

// Mock computation engine for Form 16 metadata
router.post('/generate-preview', async (req: Request, res: Response) => {
    try {
        // In a real SCENARIO, this fuses EmployeeCTC, TaxSlab, TaxBenefitDocument, and TdsPaidSummary
        // Currently returning mock structural generation payload for the UI.
        const { user_ids, financial_year } = req.body;

        if (!user_ids || !financial_year) {
            return res.status(400).json({ error: 'Missing target users or financial year.' });
        }

        const documents = await Promise.all((user_ids as number[]).map(async (uid) => {
            // Check if exists
            const existing = await prisma.form16Document.findFirst({
                where: { user_id: uid, financial_year }
            });

            if (existing) {
                return prisma.form16Document.update({
                    where: { id: existing.id },
                    data: { status: 'Generated', generated_date: new Date() }
                });
            } else {
                return prisma.form16Document.create({
                    data: {
                        user_id: uid,
                        financial_year,
                        status: 'Generated',
                        generated_date: new Date()
                    }
                });
            }
        }));

        res.json({ message: 'Form 16 generation initiated.', processed: documents.length });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to compute Form 16.' });
    }
});

router.put('/:id/publish', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { pdf_url } = req.body;

        const updated = await prisma.form16Document.update({
            where: { id },
            data: { 
                status: 'Sent', 
                sent_date: new Date(),
                pdf_url 
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to publish Form 16.' });
    }
});

export default router;
