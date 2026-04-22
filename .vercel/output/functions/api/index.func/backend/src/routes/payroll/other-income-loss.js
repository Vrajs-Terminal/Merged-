"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// Get Other Incomes / Losses
router.get('/', async (req, res) => {
    try {
        const { financial_year, user_id, type } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = String(financial_year);
        if (user_id)
            where.user_id = parseInt(String(user_id));
        if (type)
            where.type = String(type);
        const records = await prismaClient_1.default.otherIncomeLoss.findMany({
            where,
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch records.' });
    }
});
// Add a new entry
router.post('/', async (req, res) => {
    try {
        const { user_id, financial_year, type, source, amount, description, proof_url } = req.body;
        if (!user_id || !financial_year || !type || !source || amount === undefined) {
            return res.status(400).json({ error: 'Missing req details' });
        }
        if (amount < 0) {
            return res.status(400).json({ error: 'Amount cannot be negative.' });
        }
        const entry = await prismaClient_1.default.otherIncomeLoss.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add record.' });
    }
});
// Update Entry
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { type, source, amount, description, proof_url, status } = req.body;
        if (amount !== undefined && amount < 0) {
            return res.status(400).json({ error: 'Amount cannot be negative.' });
        }
        const updated = await prismaClient_1.default.otherIncomeLoss.update({
            where: { id },
            data: { type, source, amount, description, proof_url, status }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update record.' });
    }
});
// Delete Entry
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prismaClient_1.default.otherIncomeLoss.delete({ where: { id } });
        res.json({ message: 'Record deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete record.' });
    }
});
exports.default = router;
//# sourceMappingURL=other-income-loss.js.map