import { Router, Request, Response } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// Get Form 12B details with filters
router.get('/', async (req: Request, res: Response) => {
    try {
        const { financial_year, user_id, status } = req.query;
        let where: any = {};

        if (financial_year) where.financial_year = String(financial_year);
        if (user_id) where.user_id = parseInt(String(user_id));
        if (status) where.status = typeof status === 'string' ? { in: status.split(',') } : status;

        const forms = await prisma.form12BDetail.findMany({
            where,
            include: { user: { select: { id: true, name: true, employeeCTCs: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(forms);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch Form 12B details' });
    }
});

// Single user Form 12B detail
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const form = await prisma.form12BDetail.findUnique({
            where: { id },
            include: { user: { select: { name: true } } }
        });
        
        if (!form) return res.status(404).json({ error: 'Form 12B not found' });
        res.json(form);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch form details' });
    }
});

// Create new Form 12B
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            user_id, financial_year, previous_company, tan_no,
            period_from, period_to, gross_salary, exemptions,
            professional_tax, standard_deduction, other_deductions,
            tds_deducted, other_income
        } = req.body;

        if (!user_id || !financial_year || !previous_company || !period_from || !period_to || gross_salary === undefined) {
            return res.status(400).json({ error: 'Missing core Form 12B parameters.' });
        }

        const dateFrom = new Date(period_from);
        const dateTo = new Date(period_to);
        if (dateTo < dateFrom) {
            return res.status(400).json({ error: 'Period To cannot be before Period From.' });
        }

        const newForm = await prisma.form12BDetail.create({
            data: {
                user_id,
                financial_year,
                previous_company,
                tan_no,
                period_from: dateFrom,
                period_to: dateTo,
                gross_salary: Number(gross_salary),
                exemptions: Number(exemptions || 0),
                professional_tax: Number(professional_tax || 0),
                standard_deduction: Number(standard_deduction || 0),
                other_deductions: Number(other_deductions || 0),
                tds_deducted: Number(tds_deducted || 0),
                other_income: Number(other_income || 0),
                status: 'Draft'
            }
        });

        res.json(newForm);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to save Form 12B.' });
    }
});

// Update an existing Form 12B
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const {
            previous_company, tan_no, period_from, period_to,
            gross_salary, exemptions, professional_tax,
            standard_deduction, other_deductions, tds_deducted,
            other_income, status
        } = req.body;

        const updateData: any = {
            previous_company, 
            tan_no, 
            gross_salary: gross_salary !== undefined ? Number(gross_salary) : undefined,
            exemptions: exemptions !== undefined ? Number(exemptions) : undefined,
            professional_tax: professional_tax !== undefined ? Number(professional_tax) : undefined,
            standard_deduction: standard_deduction !== undefined ? Number(standard_deduction) : undefined,
            other_deductions: other_deductions !== undefined ? Number(other_deductions) : undefined,
            tds_deducted: tds_deducted !== undefined ? Number(tds_deducted) : undefined,
            other_income: other_income !== undefined ? Number(other_income) : undefined,
            status
        };

        if (period_from) updateData.period_from = new Date(period_from);
        if (period_to) updateData.period_to = new Date(period_to);

        const updated = await prisma.form12BDetail.update({
            where: { id },
            data: updateData
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update Form 12B.' });
    }
});

// Delete Form 12B
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.form12BDetail.delete({ where: { id } });
        res.json({ message: 'Form 12B declared and deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete Form 12B.' });
    }
});

export default router;
