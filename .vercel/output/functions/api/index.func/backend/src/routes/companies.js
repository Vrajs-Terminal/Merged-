"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all companies ordered by index
router.get('/', async (req, res) => {
    try {
        const companies = await prismaClient_1.default.company.findMany({
            orderBy: { order_index: 'asc' }
        });
        res.json(companies);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});
// Create a new sister company
router.post('/', async (req, res) => {
    var _a;
    let { name, code, status } = req.body;
    if (!name)
        return res.status(400).json({ error: 'Company Name is required' });
    // Handle optional code
    if (!code || code.trim() === '')
        code = null;
    try {
        const maxOrder = await prismaClient_1.default.company.aggregate({ _max: { order_index: true } });
        const newOrderIndex = ((_a = maxOrder._max.order_index) !== null && _a !== void 0 ? _a : 0) + 1;
        const company = await prismaClient_1.default.company.create({
            data: {
                name,
                code,
                status: status || 'Active',
                order_index: newOrderIndex
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'CREATED', 'COMPANY', company.name);
        res.status(201).json(company);
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ error: 'Company Code must be unique' });
        res.status(500).json({ error: 'Failed to create company' });
    }
});
// Update a company
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    let { name, code, status } = req.body;
    // Handle optional code
    if (!code || code.trim() === '')
        code = null;
    try {
        const company = await prismaClient_1.default.company.update({
            where: { id: Number(id) },
            data: { name, code, status }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'COMPANY', company.name);
        res.json(company);
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ error: 'Company Code must be unique' });
        res.status(500).json({ error: 'Failed to update company' });
    }
});
// Delete a company
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent deletion if branches rely on it
        const linkedBranches = await prismaClient_1.default.branch.count({ where: { company_id: Number(id) } });
        if (linkedBranches > 0) {
            return res.status(400).json({ error: 'Cannot delete: Branches are currently assigned to this company. Soft-delete instead by changing Status to Inactive.' });
        }
        await prismaClient_1.default.company.delete({ where: { id: Number(id) } });
        await (0, activityLogger_1.logActivity)(null, 'DELETED', 'COMPANY', `Company #${id}`);
        res.json({ message: 'Company deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete company' });
    }
});
// Reorder companies
router.put('/reorder/update', async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid items array' });
    }
    try {
        const transaction = items.map((item) => prismaClient_1.default.company.update({
            where: { id: item.id },
            data: { order_index: item.order_index }
        }));
        await prismaClient_1.default.$transaction(transaction);
        await (0, activityLogger_1.logActivity)(null, 'REORDERED', 'COMPANY', 'Reordered sister companies');
        res.json({ message: 'Reordered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reorder companies' });
    }
});
exports.default = router;
//# sourceMappingURL=companies.js.map