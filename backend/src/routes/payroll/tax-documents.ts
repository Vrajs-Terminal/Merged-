import { Router, Request, Response } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// GET all documents with extensive filtering
router.get('/', async (req: Request, res: Response) => {
    try {
        const { 
            financial_year, 
            status, 
            user_id, 
            category_id, 
            sub_category_id,
            branch_id,
            department_id
        } = req.query;

        let where: any = {};
        
        if (financial_year) where.financial_year = String(financial_year);
        if (status) where.status = typeof status === 'string' ? { in: status.split(',') } : status;
        if (user_id) where.user_id = parseInt(String(user_id));
        if (category_id) where.category_id = parseInt(String(category_id));
        if (sub_category_id) where.sub_category_id = parseInt(String(sub_category_id));
        
        // Deep relationship filtering
        if (branch_id || department_id) {
            where.user = { is: {} };
            if (branch_id) where.user.is.branch_id = parseInt(String(branch_id));
            if (department_id) where.user.is.department_id = parseInt(String(department_id));
        }

        const documents = await prisma.taxBenefitDocument.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, employeeCTCs: true }
                },
                category: true,
                subCategory: true
            },
            orderBy: { submitted_date: 'desc' }
        });

        res.json(documents);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch tax documents' });
    }
});

// POST a new document
router.post('/', async (req: Request, res: Response) => {
    try {
        const { user_id, category_id, sub_category_id, financial_year, declared_amount, proof_url } = req.body;
        
        if (!user_id || !category_id || !sub_category_id || !financial_year || declared_amount === undefined) {
            return res.status(400).json({ error: 'Missing required document fields.' });
        }

        const doc = await prisma.taxBenefitDocument.create({
            data: {
                user_id,
                category_id,
                sub_category_id,
                financial_year,
                declared_amount,
                proof_url,
                status: 'Pending'
            }
        });

        res.json(doc);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create tax document' });
    }
});

// PUT update status (Approve, Reject, Under Review)
router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status, rejection_reason, action_by_id } = req.body;

        if (!status) return res.status(400).json({ error: 'Status is required' });
        if (status === 'Rejected' && !rejection_reason) {
            return res.status(400).json({ error: 'Rejection reason is mandatory when rejecting a document' });
        }

        const updated = await prisma.taxBenefitDocument.update({
            where: { id },
            data: {
                status,
                rejection_reason: status === 'Rejected' ? rejection_reason : null,
                action_date: new Date(),
                action_by_id
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update document status' });
    }
});

// PUT update document payload (Re-uploading proof or modifying amount)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { declared_amount, proof_url, status } = req.body;

        const updated = await prisma.taxBenefitDocument.update({
            where: { id },
            data: {
                declared_amount,
                proof_url,
                // Changing proof generally resets it to Pending unless told otherwise
                status: status || 'Pending',
                rejection_reason: null
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update tax document' });
    }
});

// DELETE a document
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.taxBenefitDocument.delete({ where: { id } });
        res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete tax document' });
    }
});

export default router;
