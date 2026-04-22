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
// Get all expenses
router.get('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const where = {};
        if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
            where.user_id = user.id;
        }
        const expenses = yield prismaClient_1.default.expenseRequest.findMany({
            where,
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
}));
router.post('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, category, description, date } = req.body;
    const user = req.user;
    try {
        const expense = yield prismaClient_1.default.expenseRequest.create({
            data: {
                user_id: user.id,
                amount: parseFloat(amount),
                category,
                description,
                date: new Date(date),
                status: 'Pending'
            }
        });
        yield (0, activityLogger_1.logActivity)(user.id, 'CREATED', 'EXPENSE', category);
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
}));
router.put('/:id/status', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const admin = req.user;
    if (admin.role !== 'Admin' && admin.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        const updated = yield prismaClient_1.default.expenseRequest.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        yield (0, activityLogger_1.logActivity)(admin.id, status === 'Approved' ? 'APPROVED' : 'REJECTED', 'EXPENSE', `Expense #${id}`);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
}));
exports.default = router;
