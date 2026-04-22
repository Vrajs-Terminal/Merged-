"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// GET all documents with extensive filtering
router.get('/', async (req, res) => {
    try {
        const { financial_year, status, user_id, category_id, sub_category_id, branch_id, department_id } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = String(financial_year);
        if (status)
            where.status = typeof status === 'string' ? { in: status.split(',') } : status;
        if (user_id)
            where.user_id = parseInt(String(user_id));
        if (category_id)
            where.category_id = parseInt(String(category_id));
        if (sub_category_id)
            where.sub_category_id = parseInt(String(sub_category_id));
        // Deep relationship filtering
        if (branch_id || department_id) {
            where.user = { is: {} };
            if (branch_id)
                where.user.is.branch_id = parseInt(String(branch_id));
            if (department_id)
                where.user.is.department_id = parseInt(String(department_id));
        }
        const documents = await prismaClient_1.default.taxBenefitDocument.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tax documents' });
    }
});
// POST a new document
router.post('/', async (req, res) => {
    try {
        const { user_id, category_id, sub_category_id, financial_year, declared_amount, proof_url } = req.body;
        if (!user_id || !category_id || !sub_category_id || !financial_year || declared_amount === undefined) {
            return res.status(400).json({ error: 'Missing required document fields.' });
        }
        const doc = await prismaClient_1.default.taxBenefitDocument.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create tax document' });
    }
});
// PUT update status (Approve, Reject, Under Review)
router.put('/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, rejection_reason, action_by_id } = req.body;
        if (!status)
            return res.status(400).json({ error: 'Status is required' });
        if (status === 'Rejected' && !rejection_reason) {
            return res.status(400).json({ error: 'Rejection reason is mandatory when rejecting a document' });
        }
        const updated = await prismaClient_1.default.taxBenefitDocument.update({
            where: { id },
            data: {
                status,
                rejection_reason: status === 'Rejected' ? rejection_reason : null,
                action_date: new Date(),
                action_by_id
            }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update document status' });
    }
});
// PUT update document payload (Re-uploading proof or modifying amount)
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { declared_amount, proof_url, status } = req.body;
        const updated = await prismaClient_1.default.taxBenefitDocument.update({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update tax document' });
    }
});
// DELETE a document
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prismaClient_1.default.taxBenefitDocument.delete({ where: { id } });
        res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete tax document' });
    }
});
exports.default = router;
//# sourceMappingURL=tax-documents.js.map