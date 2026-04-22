"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// Get configured slabs
router.get('/', async (req, res) => {
    try {
        const { financial_year, tax_regime, slab_type } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = financial_year;
        if (tax_regime)
            where.tax_regime = tax_regime;
        if (slab_type)
            where.slab_type = slab_type;
        const slabs = await prismaClient_1.default.incomeTaxSlab.findMany({
            where,
            orderBy: { from_amount: 'asc' }
        });
        res.json(slabs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch income tax slabs' });
    }
});
// Create multiple slabs at once (Bulk override for a specific regime + type + fy)
router.post('/bulk', async (req, res) => {
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
        const createdSlabs = await prismaClient_1.default.$transaction(async (tx) => {
            await tx.incomeTaxSlab.deleteMany({
                where: { financial_year, tax_regime, slab_type, is_locked: false }
            });
            return Promise.all(slabs.map((slab) => tx.incomeTaxSlab.create({
                data: {
                    financial_year,
                    tax_regime,
                    slab_type,
                    from_amount: slab.from_amount,
                    to_amount: slab.to_amount,
                    tax_percentage: slab.tax_percentage,
                    status: slab.status || 'Active'
                }
            })));
        });
        res.json(createdSlabs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save income tax slabs' });
    }
});
// Delete a slab
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const slab = await prismaClient_1.default.incomeTaxSlab.findUnique({ where: { id } });
        if (!slab)
            return res.status(404).json({ error: 'Slab not found' });
        if (slab.is_locked)
            return res.status(400).json({ error: 'Cannot delete locked slabs.' });
        await prismaClient_1.default.incomeTaxSlab.delete({ where: { id } });
        res.json({ message: 'Slab deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete income tax slab' });
    }
});
exports.default = router;
//# sourceMappingURL=tax-slabs.js.map