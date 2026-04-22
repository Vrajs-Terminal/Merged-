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
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all branches
router.get('/', authMiddleware_1.optionalAuthenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let whereClause = {};
        // Apply branch data silo restrictions if not empty
        if (user && user.role === 'Admin' && user.restrictedBranchIds && user.restrictedBranchIds.length > 0) {
            whereClause = { id: { in: user.restrictedBranchIds } };
        }
        const branches = yield prismaClient_1.default.branch.findMany({
            where: whereClause,
            orderBy: { order_index: 'asc' },
            include: { departments: true }
        });
        res.json(branches);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
}));
// Create a new branch
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, code, type } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    try {
        let finalCode = code;
        if (!finalCode) {
            // Generate a random unique code if not provided
            finalCode = `BR-${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
        }
        const existingBranch = yield prismaClient_1.default.branch.findUnique({ where: { code: finalCode } });
        if (existingBranch) {
            return res.status(400).json({ error: 'Branch code already exists' });
        }
        const maxOrder = yield prismaClient_1.default.branch.aggregate({
            _max: { order_index: true }
        });
        const nextOrder = (maxOrder._max.order_index || 0) + 1;
        const branch = yield prismaClient_1.default.branch.create({
            data: {
                name,
                code: finalCode,
                type: type || 'Metro',
                order_index: nextOrder
            },
            include: { departments: true }
        });
        const user = req.user;
        yield (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'CREATED', 'BRANCH', branch.name, { code: branch.code, type: branch.type });
        res.status(201).json(branch);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create branch' });
    }
}));
// Delete a branch
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Check if it has departments
        const branch = yield prismaClient_1.default.branch.findUnique({
            where: { id: parseInt(id) },
            include: { departments: true }
        });
        if (!branch)
            return res.status(404).json({ error: 'Branch not found' });
        if (branch.departments.length > 0) {
            return res.status(400).json({ error: 'Cannot delete branch with active departments' });
        }
        const user = req.user;
        yield prismaClient_1.default.branch.delete({ where: { id: parseInt(id) } });
        yield (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'DELETED', 'BRANCH', branch.name);
        res.json({ message: 'Branch deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete branch' });
    }
}));
// Bulk Import Branches
router.post('/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { branches } = req.body;
    if (!branches || !Array.isArray(branches)) {
        return res.status(400).json({ error: 'Invalid branches data' });
    }
    try {
        const results = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            let count = 0;
            for (const b of branches) {
                // Skip if name is missing
                if (!b.name)
                    continue;
                let finalCode = b.code;
                if (!finalCode) {
                    finalCode = `BR-${b.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
                }
                // Check for existing code in DB
                const existing = yield tx.branch.findUnique({ where: { code: finalCode } });
                if (existing)
                    continue;
                yield tx.branch.create({
                    data: {
                        name: b.name,
                        code: finalCode,
                        type: b.type || 'Metro',
                        order_index: 0 // Will need re-ordering
                    }
                });
                count++;
            }
            return { count };
        }));
        const user = req.user;
        yield (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'BULK_IMPORT', 'BRANCH', `Imported ${results.count} branches`);
        res.json(results);
    }
    catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ error: 'Failed to bulk import branches' });
    }
}));
exports.default = router;
