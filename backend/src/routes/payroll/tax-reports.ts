import { Router, Request, Response } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// Dynamic Reports Dashboard Aggregator
router.get('/', async (req: Request, res: Response) => {
    try {
        const financial_year = (req.query.financial_year as string) || '2025-26';

        // 1. Under Tax Employees (For Demo: employees with unassigned regimes or missing docs)
        const unassignedRegimeUsers = await prisma.employeeTaxRegime.findMany({
            where: { financial_year, tax_regime: 'Not Assigned' },
            include: { user: { select: { id: true, name: true } } }
        });

        // 2. Form 16 Tracking Stats
        const form16StatsRaw = await prisma.form16Document.groupBy({
            by: ['status'],
            where: { financial_year },
            _count: { id: true }
        });
        
        const totalUsers = await prisma.user.count();
        const f16Map = form16StatsRaw.reduce((acc: any, curr: any) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, { 'Pending': 0, 'Generated': 0, 'Sent': 0 });
        f16Map['Pending'] += Math.max(0, totalUsers - (f16Map['Generated'] + f16Map['Sent']));

        // 3. Tax Benefit Fulfillment (Doc Statuses)
        const docStatsRaw = await prisma.taxBenefitDocument.groupBy({
            by: ['status'],
            where: { financial_year },
            _count: { id: true }
        });

        const docStats = docStatsRaw.reduce((acc: any, curr: any) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, { 'Pending': 0, 'Under Review': 0, 'Approved': 0, 'Rejected': 0 });

        // 4. IT Drill-Down (High Level Aggregates)
        // E.g., How many users filed Other Incomes vs Form12B
        const otherIncomeCount = await prisma.otherIncomeLoss.count({ where: { financial_year, type: 'Income' } });
        const form12BCount = await prisma.form12BDetail.count({ where: { financial_year } });

        res.json({
            under_tax: {
                count: unassignedRegimeUsers.length,
                samples: unassignedRegimeUsers.slice(0, 5) // Send a few for UI preview
            },
            form16: f16Map,
            benefits: docStats,
            drill_down: {
                declared_other_income: otherIncomeCount,
                declared_previous_employer: form12BCount,
                total_active: totalUsers
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Failed to aggregate tax analytics.' });
    }
});

export default router;
