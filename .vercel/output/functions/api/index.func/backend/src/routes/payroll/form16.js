"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// Get Form 16 Tracking Status
router.get('/', async (req, res) => {
    try {
        const { financial_year, status } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = String(financial_year);
        if (status)
            where.status = String(status);
        const forms = await prismaClient_1.default.form16Document.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, employeeCTCs: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(forms);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch Form 16 trackers.' });
    }
});
// Mock computation engine for Form 16 metadata
router.post('/generate-preview', async (req, res) => {
    try {
        // In a real SCENARIO, this fuses EmployeeCTC, TaxSlab, TaxBenefitDocument, and TdsPaidSummary
        // Currently returning mock structural generation payload for the UI.
        const { user_ids, financial_year } = req.body;
        if (!user_ids || !financial_year) {
            return res.status(400).json({ error: 'Missing target users or financial year.' });
        }
        const documents = await Promise.all(user_ids.map(async (uid) => {
            // Check if exists
            const existing = await prismaClient_1.default.form16Document.findFirst({
                where: { user_id: uid, financial_year }
            });
            if (existing) {
                return prismaClient_1.default.form16Document.update({
                    where: { id: existing.id },
                    data: { status: 'Generated', generated_date: new Date() }
                });
            }
            else {
                return prismaClient_1.default.form16Document.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to compute Form 16.' });
    }
});
router.put('/:id/publish', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { pdf_url } = req.body;
        const updated = await prismaClient_1.default.form16Document.update({
            where: { id },
            data: {
                status: 'Sent',
                sent_date: new Date(),
                pdf_url
            }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to publish Form 16.' });
    }
});
exports.default = router;
//# sourceMappingURL=form16.js.map