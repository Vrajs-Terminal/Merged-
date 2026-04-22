"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// Get Form 16 Tracking Status
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { financial_year, status } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = String(financial_year);
        if (status)
            where.status = String(status);
        const forms = yield prismaClient_1.default.form16Document.findMany({
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
}));
// Mock computation engine for Form 16 metadata
router.post('/generate-preview', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real SCENARIO, this fuses EmployeeCTC, TaxSlab, TaxBenefitDocument, and TdsPaidSummary
        // Currently returning mock structural generation payload for the UI.
        const { user_ids, financial_year } = req.body;
        if (!user_ids || !financial_year) {
            return res.status(400).json({ error: 'Missing target users or financial year.' });
        }
        const documents = yield Promise.all(user_ids.map((uid) => __awaiter(void 0, void 0, void 0, function* () {
            // Check if exists
            const existing = yield prismaClient_1.default.form16Document.findFirst({
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
        })));
        res.json({ message: 'Form 16 generation initiated.', processed: documents.length });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to compute Form 16.' });
    }
}));
router.put('/:id/publish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { pdf_url } = req.body;
        const updated = yield prismaClient_1.default.form16Document.update({
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
}));
exports.default = router;
