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
// Get Form 12B details with filters
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { financial_year, user_id, status } = req.query;
        let where = {};
        if (financial_year)
            where.financial_year = String(financial_year);
        if (user_id)
            where.user_id = parseInt(String(user_id));
        if (status)
            where.status = typeof status === 'string' ? { in: status.split(',') } : status;
        const forms = yield prismaClient_1.default.form12BDetail.findMany({
            where,
            include: { user: { select: { id: true, name: true, employeeCTCs: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(forms);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch Form 12B details' });
    }
}));
// Single user Form 12B detail
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const form = yield prismaClient_1.default.form12BDetail.findUnique({
            where: { id },
            include: { user: { select: { name: true } } }
        });
        if (!form)
            return res.status(404).json({ error: 'Form 12B not found' });
        res.json(form);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch form details' });
    }
}));
// Create new Form 12B
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, financial_year, previous_company, tan_no, period_from, period_to, gross_salary, exemptions, professional_tax, standard_deduction, other_deductions, tds_deducted, other_income } = req.body;
        if (!user_id || !financial_year || !previous_company || !period_from || !period_to || gross_salary === undefined) {
            return res.status(400).json({ error: 'Missing core Form 12B parameters.' });
        }
        const dateFrom = new Date(period_from);
        const dateTo = new Date(period_to);
        if (dateTo < dateFrom) {
            return res.status(400).json({ error: 'Period To cannot be before Period From.' });
        }
        const newForm = yield prismaClient_1.default.form12BDetail.create({
            data: {
                user_id,
                financial_year,
                previous_company,
                tan_no,
                period_from: dateFrom,
                period_to: dateTo,
                gross_salary: Number(gross_salary),
                exemptions: Number(exemptions || 0),
                professional_tax: Number(professional_tax || 0),
                standard_deduction: Number(standard_deduction || 0),
                other_deductions: Number(other_deductions || 0),
                tds_deducted: Number(tds_deducted || 0),
                other_income: Number(other_income || 0),
                status: 'Draft'
            }
        });
        res.json(newForm);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save Form 12B.' });
    }
}));
// Update an existing Form 12B
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { previous_company, tan_no, period_from, period_to, gross_salary, exemptions, professional_tax, standard_deduction, other_deductions, tds_deducted, other_income, status } = req.body;
        const updateData = {
            previous_company,
            tan_no,
            gross_salary: gross_salary !== undefined ? Number(gross_salary) : undefined,
            exemptions: exemptions !== undefined ? Number(exemptions) : undefined,
            professional_tax: professional_tax !== undefined ? Number(professional_tax) : undefined,
            standard_deduction: standard_deduction !== undefined ? Number(standard_deduction) : undefined,
            other_deductions: other_deductions !== undefined ? Number(other_deductions) : undefined,
            tds_deducted: tds_deducted !== undefined ? Number(tds_deducted) : undefined,
            other_income: other_income !== undefined ? Number(other_income) : undefined,
            status
        };
        if (period_from)
            updateData.period_from = new Date(period_from);
        if (period_to)
            updateData.period_to = new Date(period_to);
        const updated = yield prismaClient_1.default.form12BDetail.update({
            where: { id },
            data: updateData
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update Form 12B.' });
    }
}));
// Delete Form 12B
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield prismaClient_1.default.form12BDetail.delete({ where: { id } });
        res.json({ message: 'Form 12B declared and deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete Form 12B.' });
    }
}));
exports.default = router;
