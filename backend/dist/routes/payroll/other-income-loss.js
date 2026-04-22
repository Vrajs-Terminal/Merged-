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
// Get Other Incomes / Losses
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { financial_year, user_id, type } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = String(financial_year);
        if (user_id)
            where.user_id = parseInt(String(user_id));
        if (type)
            where.type = String(type);
        const records = yield prismaClient_1.default.otherIncomeLoss.findMany({
            where,
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch records.' });
    }
}));
// Add a new entry
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, financial_year, type, source, amount, description, proof_url } = req.body;
        if (!user_id || !financial_year || !type || !source || amount === undefined) {
            return res.status(400).json({ error: 'Missing req details' });
        }
        if (amount < 0) {
            return res.status(400).json({ error: 'Amount cannot be negative.' });
        }
        const entry = yield prismaClient_1.default.otherIncomeLoss.create({
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
}));
// Update Entry
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { type, source, amount, description, proof_url, status } = req.body;
        if (amount !== undefined && amount < 0) {
            return res.status(400).json({ error: 'Amount cannot be negative.' });
        }
        const updated = yield prismaClient_1.default.otherIncomeLoss.update({
            where: { id },
            data: { type, source, amount, description, proof_url, status }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update record.' });
    }
}));
// Delete Entry
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield prismaClient_1.default.otherIncomeLoss.delete({ where: { id } });
        res.json({ message: 'Record deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete record.' });
    }
}));
exports.default = router;
