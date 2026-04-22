"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// Dynamic Reports Dashboard Aggregator
router.get('/', async (req, res) => {
    try {
        const financial_year = req.query.financial_year || '2025-26';
        // 1. Under Tax Employees (For Demo: employees with unassigned regimes or missing docs)
        const unassignedRegimeUsers = await prismaClient_1.default.employeeTaxRegime.findMany({
            where: { financial_year, tax_regime: 'Not Assigned' },
            include: { user: { select: { id: true, name: true } } }
        });
        // 2. Form 16 Tracking Stats
        const form16StatsRaw = await prismaClient_1.default.form16Document.groupBy({
            by: ['status'],
            where: { financial_year },
            _count: { id: true }
        });
        const totalUsers = await prismaClient_1.default.user.count();
        const f16Map = form16StatsRaw.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, { 'Pending': 0, 'Generated': 0, 'Sent': 0 });
        f16Map['Pending'] += Math.max(0, totalUsers - (f16Map['Generated'] + f16Map['Sent']));
        // 3. Tax Benefit Fulfillment (Doc Statuses)
        const docStatsRaw = await prismaClient_1.default.taxBenefitDocument.groupBy({
            by: ['status'],
            where: { financial_year },
            _count: { id: true }
        });
        const docStats = docStatsRaw.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, { 'Pending': 0, 'Under Review': 0, 'Approved': 0, 'Rejected': 0 });
        // 4. IT Drill-Down (High Level Aggregates)
        // E.g., How many users filed Other Incomes vs Form12B
        const otherIncomeCount = await prismaClient_1.default.otherIncomeLoss.count({ where: { financial_year, type: 'Income' } });
        const form12BCount = await prismaClient_1.default.form12BDetail.count({ where: { financial_year } });
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to aggregate tax analytics.' });
    }
});
exports.default = router;
//# sourceMappingURL=tax-reports.js.map