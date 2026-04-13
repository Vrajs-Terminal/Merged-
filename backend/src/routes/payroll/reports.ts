import express from 'express';
import prisma from '../../lib/prismaClient';
import { logActivity } from '../../services/activityLogger';

const router = express.Router();

/**
 * 1. Bank Statement Report
 * Aggregates net salary and bank details for published slips.
 */
router.get('/bank-statement', async (req, res) => {
    try {
        const { month, year, branch_id } = req.query;
        const where: any = { status: 'Published' };
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);
        if (branch_id) where.user = { branch_id: parseInt(branch_id as string) };

        const slips = await prisma.salarySlip.findMany({
            where,
            include: {
                user: {
                    include: {
                        bankDetails: { where: { is_primary: true } }
                    }
                }
            }
        });

        const report = slips.map(s => ({
            employee_name: s.user.name,
            account_number: s.user.bankDetails[0]?.account_number || 'N/A',
            ifsc: s.user.bankDetails[0]?.ifsc_code || 'N/A',
            net_salary: s.net_salary,
            bank_name: s.user.bankDetails[0]?.bank_name || 'N/A'
        }));

        res.json(report);
    } catch (error) {
        console.error("Bank Statement Error:", error);
        res.status(500).json({ error: "Failed to generate Bank Statement" });
    }
});

/**
 * 2. PF / ESIC Report
 * Extracts PF and ESIC deductions from published slips.
 */
router.get('/pf-esic', async (req, res) => {
    try {
        const { month, year } = req.query;
        const where: any = { status: 'Published' };
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);

        const slips = await prisma.salarySlip.findMany({
            where,
            include: {
                user: { include: { bankDetails: { where: { is_primary: true } } } },
                items: true
            }
        });

        const report = slips.map(s => {
            const pfItem = s.items.find(i => i.name.toUpperCase().includes('PF'));
            const esicItem = s.items.find(i => i.name.toUpperCase().includes('ESIC'));
            return {
                employee_name: s.user.name,
                pf_no: s.user.bankDetails[0]?.pf_no || 'N/A',
                esic_no: s.user.bankDetails[0]?.esic_no || 'N/A',
                gross_salary: s.this_month_gross,
                pf_amount: pfItem?.amount || 0,
                esic_amount: esicItem?.amount || 0
            };
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate PF/ESIC report" });
    }
});

/**
 * 3. Summary Report (Gross to Net)
 * Provides high-level payroll totals for a period.
 */
router.get('/summary', async (req, res) => {
    try {
        const { month, year } = req.query;
        const where: any = { status: 'Published' };
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);

        const totals = await prisma.salarySlip.aggregate({
            where,
            _sum: {
                this_month_gross: true,
                total_earnings: true,
                total_deductions: true,
                net_salary: true
            },
            _count: true
        });

        res.json(totals);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate Summary report" });
    }
});

/**
 * 4. Hold Salary Report
 * Lists all approved hold requests for a specific period.
 */
router.get('/hold-salary', async (req, res) => {
    try {
        const { month, year } = req.query;
        const where: any = { status: 'Approved' };
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);

        const holds = await prisma.salaryHoldRequest.findMany({
            where,
            include: {
                employee: { select: { name: true, branch: { select: { name: true } } } },
                reportingUser: { select: { name: true } }
            }
        });

        res.json(holds);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch hold report" });
    }
});

/**
 * 5. Allowances & Deductions Report
 * Detail view of all slip items across employees.
 */
router.get('/allowances', async (req, res) => {
    try {
        const { month, year, type } = req.query; // type: 'Earning' or 'Deduction'
        const where: any = { status: 'Published' };
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);

        const slips = await prisma.salarySlip.findMany({
            where,
            include: {
                items: type ? { where: { type: type as string } } : true,
                user: { select: { name: true } }
            }
        });
        res.json(slips);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate Allowance report" });
    }
});

// 8. CTC Audit Report
router.get('/ctc-audit', async (req, res) => {
    try {
        const audits = await prisma.salaryGroupChangeLog.findMany({
            include: {
                user: { select: { name: true } },
                oldGroup: { select: { name: true } },
                newGroup: { select: { name: true } },
                admin: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(audits);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate CTC Audit report" });
    }
});

// 9. Incentive Report
router.get('/incentives', async (req, res) => {
    try {
        const { month, year } = req.query;
        const result = await prisma.employeeIncentiveDetail.findMany({
            where: { month: parseInt(month as string), year: parseInt(year as string) },
            include: { user: { select: { name: true } }, incentiveType: { select: { name: true } } }
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate Incentive report" });
    }
});

// 10. F&F Settlement Report
router.get('/ff-settlement', async (req, res) => {
    try {
        const results = await prisma.fFSettlement.findMany({
            include: { user: { select: { name: true } } }
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate F&F report" });
    }
});

// 11. Attendance vs Salary Report
router.get('/attendance-sync', async (req, res) => {
    try {
        const { month, year } = req.query;
        const slips = await prisma.salarySlip.findMany({
            where: { month: parseInt(month as string), year: parseInt(year as string) },
            select: {
                user: { select: { name: true } },
                month_working_days: true,
                employee_working_days: true,
                total_leaves: true,
                net_salary: true
            }
        });
        res.json(slips);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate Attendance Sync report" });
    }
});

// 12. Yearly Earning Report (Form 16 Helper)
router.get('/yearly-statement', async (req, res) => {
    try {
        const { year, user_id } = req.query;
        const slips = await prisma.salarySlip.findMany({
            where: { year: parseInt(year as string), user_id: parseInt(user_id as string) },
            include: { items: true }
        });
        res.json(slips);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate Yearly statement" });
    }
});

// 13. Professional Tax & Compliance Report
router.get('/compliance', async (req, res) => {
    try {
        const { month, year } = req.query;
        const slips = await prisma.salarySlip.findMany({
            where: { month: parseInt(month as string), year: parseInt(year as string), status: 'Published' },
            include: { items: { where: { name: { in: ['Professional Tax', 'PT', 'TDS', 'Income Tax'] } } }, user: { select: { name: true } } }
        });
        res.json(slips);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate Compliance report" });
    }
});

export default router;
