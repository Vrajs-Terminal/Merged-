import { Router, Request, Response } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// ==========================================
// TDS Challan Master Operations
// ==========================================

// Get Challans
router.get('/', async (req: Request, res: Response) => {
    try {
        const { financial_year, month } = req.query;
        let where: any = {};
        if (financial_year) where.financial_year = String(financial_year);
        if (month) where.month = parseInt(String(month));

        const challans = await prisma.tdsChallan.findMany({
            where,
            include: {
                _count: { select: { summaries: true } }
            },
            orderBy: { challan_date: 'desc' }
        });

        res.json(challans);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch Challans.' });
    }
});

// Create Challan
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            financial_year, month, tds_type, payment_mode, 
            bank_name, challan_date, total_amount, bsr_code, cin_no
        } = req.body;

        if (!financial_year || !month || !payment_mode || !challan_date || total_amount === undefined) {
            return res.status(400).json({ error: 'Missing core challan parameters.' });
        }

        const newChallan = await prisma.tdsChallan.create({
            data: {
                financial_year,
                month: Number(month),
                tds_type: tds_type || 'TDS',
                payment_mode,
                bank_name,
                challan_date: new Date(challan_date),
                total_amount: Number(total_amount),
                bsr_code,
                cin_no,
                status: (bsr_code && cin_no) ? 'Paid' : 'Generated'
            }
        });

        res.json(newChallan);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate challan.' });
    }
});

// Update Challan
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { payment_mode, bank_name, challan_date, total_amount, bsr_code, cin_no, status } = req.body;

        let derivedStatus = status;
        if (!status && bsr_code && cin_no) derivedStatus = 'Paid';

        const updated = await prisma.tdsChallan.update({
            where: { id },
            data: {
                payment_mode, bank_name, bsr_code, cin_no,
                status: derivedStatus,
                ...(challan_date && { challan_date: new Date(challan_date) }),
                ...(total_amount !== undefined && { total_amount: Number(total_amount) })
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update challan.' });
    }
});


// ==========================================
// TDS Paid Summary (Employee Mapping)
// ==========================================

// Get Paid Summaries
router.get('/summary/all', async (req: Request, res: Response) => {
    try {
        const { financial_year, user_id, challan_id } = req.query;
        let where: any = {};
        
        if (financial_year) where.financial_year = String(financial_year);
        if (user_id) where.user_id = parseInt(String(user_id));
        if (challan_id) where.challan_id = parseInt(String(challan_id));

        const summaries = await prisma.tdsPaidSummary.findMany({
            where,
            include: {
                user: { select: { name: true } },
                challan: { select: { month: true, bsr_code: true, cin_no: true } }
            },
            orderBy: { deposit_date: 'desc' }
        });

        res.json(summaries);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch TDS Summaries.' });
    }
});

// Link multiple employees to a Challan
router.post('/summary/bulk', async (req: Request, res: Response) => {
    try {
        const { challan_id, financial_year, deposit_date, employee_maps } = req.body;
        // employee_maps = [{ user_id: 1, tds_amount: 5000 }, ...]

        if (!challan_id || !financial_year || !deposit_date || !Array.isArray(employee_maps)) {
            return res.status(400).json({ error: 'Invalid payload.' });
        }

        const summaries = await Promise.all(employee_maps.map((emp: any) => 
            prisma.tdsPaidSummary.create({
                data: {
                    user_id: emp.user_id,
                    challan_id: Number(challan_id),
                    financial_year,
                    tds_amount: Number(emp.tds_amount),
                    deposit_date: new Date(deposit_date)
                }
            })
        ));

        res.json(summaries);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to map employees to challan.' });
    }
});

router.delete('/summary/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.tdsPaidSummary.delete({ where: { id } });
        res.json({ message: 'Summary removed.' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete summary.' });
    }
});

export default router;
