"use strict";
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
router.get('/', authMiddleware_1.optionalAuthenticateToken, async (req, res) => {
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
        const departments = await prismaClient_1.default.department.findMany({
            where: whereClause,
            orderBy: { order_index: 'asc' },
            include: { branch: true }
        });
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});
// Create a new department
router.post('/', async (req, res) => {
    const { name, branch_id } = req.body;
    if (!name || !branch_id) {
        return res.status(400).json({ error: 'Name and Branch ID are required' });
    }
    try {
        // Check branch exists
        const branch = await prismaClient_1.default.branch.findUnique({ where: { id: parseInt(branch_id) } });
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }
        const maxOrder = await prismaClient_1.default.department.aggregate({
            where: { branch_id: parseInt(branch_id) },
            _max: { order_index: true }
        });
        const nextOrder = (maxOrder._max.order_index || 0) + 1;
        const department = await prismaClient_1.default.department.create({
            data: {
                name,
                branch_id: parseInt(branch_id),
                order_index: nextOrder
            }
        });
        const user = req.user;
        await (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'CREATED', 'DEPARTMENT', department.name, { branch_id: department.branch_id });
        res.status(201).json(department);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create department' });
    }
});
// Delete a department
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = req.user;
        await prismaClient_1.default.department.delete({ where: { id: parseInt(id) } });
        await (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'DELETED', 'DEPARTMENT', `Department #${id}`);
        res.json({ message: 'Department deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
});
exports.default = router;
//# sourceMappingURL=departments.js.map