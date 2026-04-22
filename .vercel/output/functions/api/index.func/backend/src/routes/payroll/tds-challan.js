"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// ==========================================
// TDS Challan Master Operations
// ==========================================
// Get Challans
router.get('/', async (req, res) => {
    try {
        const { financial_year, month } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = String(financial_year);
        if (month)
            where.month = parseInt(String(month));
        const challans = await prismaClient_1.default.tdsChallan.findMany({
            where,
            include: {
                _count: { select: { summaries: true } }
            },
            orderBy: { challan_date: 'desc' }
        });
        res.json(challans);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch Challans.' });
    }
});
// Create Challan
router.post('/', async (req, res) => {
    try {
        const { financial_year, month, tds_type, payment_mode, bank_name, challan_date, total_amount, bsr_code, cin_no } = req.body;
        if (!financial_year || !month || !payment_mode || !challan_date || total_amount === undefined) {
            return res.status(400).json({ error: 'Missing core challan parameters.' });
        }
        const newChallan = await prismaClient_1.default.tdsChallan.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate challan.' });
    }
});
// Update Challan
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { payment_mode, bank_name, challan_date, total_amount, bsr_code, cin_no, status } = req.body;
        let derivedStatus = status;
        if (!status && bsr_code && cin_no)
            derivedStatus = 'Paid';
        const updated = await prismaClient_1.default.tdsChallan.update({
            where: { id },
            data: {
                payment_mode, bank_name, bsr_code, cin_no,
                status: derivedStatus,
                ...(challan_date && { challan_date: new Date(challan_date) }),
                ...(total_amount !== undefined && { total_amount: Number(total_amount) })
            }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update challan.' });
    }
});
// ==========================================
// TDS Paid Summary (Employee Mapping)
// ==========================================
// Get Paid Summaries
router.get('/summary/all', async (req, res) => {
    try {
        const { financial_year, user_id, challan_id } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = String(financial_year);
        if (user_id)
            where.user_id = parseInt(String(user_id));
        if (challan_id)
            where.challan_id = parseInt(String(challan_id));
        const summaries = await prismaClient_1.default.tdsPaidSummary.findMany({
            where,
            include: {
                user: { select: { name: true } },
                challan: { select: { month: true, bsr_code: true, cin_no: true } }
            },
            orderBy: { deposit_date: 'desc' }
        });
        res.json(summaries);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch TDS Summaries.' });
    }
});
// Link multiple employees to a Challan
router.post('/summary/bulk', async (req, res) => {
    try {
        const { challan_id, financial_year, deposit_date, employee_maps } = req.body;
        // employee_maps = [{ user_id: 1, tds_amount: 5000 }, ...]
        if (!challan_id || !financial_year || !deposit_date || !Array.isArray(employee_maps)) {
            return res.status(400).json({ error: 'Invalid payload.' });
        }
        const summaries = await Promise.all(employee_maps.map((emp) => prismaClient_1.default.tdsPaidSummary.create({
            data: {
                user_id: emp.user_id,
                challan_id: Number(challan_id),
                financial_year,
                tds_amount: Number(emp.tds_amount),
                deposit_date: new Date(deposit_date)
            }
        })));
        res.json(summaries);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to map employees to challan.' });
    }
});
router.delete('/summary/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prismaClient_1.default.tdsPaidSummary.delete({ where: { id } });
        res.json({ message: 'Summary removed.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete summary.' });
    }
});
exports.default = router;
//# sourceMappingURL=tds-challan.js.map