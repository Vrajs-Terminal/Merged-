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
// Get all departments
router.get('/', authMiddleware_1.optionalAuthenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const whereClause = {};
        if (user && user.role === 'Admin') {
            const conditions = [];
            // If they are locked to specific branches, they can only see departments inside those branches
            if (user.restrictedBranchIds && user.restrictedBranchIds.length > 0) {
                conditions.push({ branch_id: { in: user.restrictedBranchIds } });
            }
            // If they are locked to specific departments, apply that additional filter
            if (user.restrictedDepartmentIds && user.restrictedDepartmentIds.length > 0) {
                conditions.push({ id: { in: user.restrictedDepartmentIds } });
            }
            if (conditions.length > 0) {
                // If both are present, typically it's an AND condition, or whichever is stricter
                whereClause.AND = conditions;
            }
        }
        const departments = yield prismaClient_1.default.department.findMany({
            where: whereClause,
            orderBy: { order_index: 'asc' },
            include: { branch: true }
        });
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
}));
// Create a new department
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, branch_id } = req.body;
    if (!name || !branch_id) {
        return res.status(400).json({ error: 'Name and Branch ID are required' });
    }
    try {
        // Check branch exists
        const branch = yield prismaClient_1.default.branch.findUnique({ where: { id: parseInt(branch_id) } });
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }
        const maxOrder = yield prismaClient_1.default.department.aggregate({
            where: { branch_id: parseInt(branch_id) },
            _max: { order_index: true }
        });
        const nextOrder = (maxOrder._max.order_index || 0) + 1;
        const department = yield prismaClient_1.default.department.create({
            data: {
                name,
                branch_id: parseInt(branch_id),
                order_index: nextOrder
            }
        });
        const user = req.user;
        yield (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'CREATED', 'DEPARTMENT', department.name, { branch_id: department.branch_id });
        res.status(201).json(department);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create department' });
    }
}));
// Delete a department
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = req.user;
        yield prismaClient_1.default.department.delete({ where: { id: parseInt(id) } });
        yield (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'DELETED', 'DEPARTMENT', `Department #${id}`);
        res.json({ message: 'Department deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
}));
exports.default = router;
