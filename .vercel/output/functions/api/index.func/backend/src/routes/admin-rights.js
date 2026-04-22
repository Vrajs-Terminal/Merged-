"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all admins with their restrictions
router.get('/', async (req, res) => {
    try {
        const admins = await prismaClient_1.default.user.findMany({
            where: { role: 'Admin' }, // Only show admins in this scope
            include: {
                adminBranchRestrictions: { include: { branch: true } },
                adminDepartmentRestrictions: { include: { department: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(admins);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin rights' });
    }
});
// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await prismaClient_1.default.user.findMany({
            where: { role: 'Employee' }, // Fetch employees
            include: {
                adminBranchRestrictions: { include: { branch: true } },
                adminDepartmentRestrictions: { include: { department: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});
// Update branch restrictions for an admin
router.put('/:userId/branches', async (req, res) => {
    const { userId } = req.params;
    const { branchIds, isAll } = req.body; // isAll true means bypass/delete restrictions
    try {
        // Clear existing restrictions
        await prismaClient_1.default.adminBranchRestriction.deleteMany({
            where: { user_id: Number(userId) }
        });
        if (!isAll && branchIds && Array.isArray(branchIds)) {
            // Apply new specific restrictions
            const data = branchIds.map(id => ({ user_id: Number(userId), branch_id: id }));
            if (data.length > 0) {
                await prismaClient_1.default.adminBranchRestriction.createMany({ data });
            }
        }
        const adminUser = req.user;
        await (0, activityLogger_1.logActivity)((adminUser === null || adminUser === void 0 ? void 0 : adminUser.id) || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated branch restrictions for user #${userId}`);
        res.json({ message: 'Branch restrictions updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update branch restrictions' });
    }
});
// Update department restrictions for an admin
router.put('/:userId/departments', async (req, res) => {
    const { userId } = req.params;
    const { departmentIds, isAll } = req.body;
    try {
        // Clear existing restrictions
        await prismaClient_1.default.adminDepartmentRestriction.deleteMany({
            where: { user_id: Number(userId) }
        });
        if (!isAll && departmentIds && Array.isArray(departmentIds)) {
            // Apply new specific restrictions
            const data = departmentIds.map(id => ({ user_id: Number(userId), department_id: id }));
            if (data.length > 0) {
                await prismaClient_1.default.adminDepartmentRestriction.createMany({ data });
            }
        }
        const adminUser = req.user;
        await (0, activityLogger_1.logActivity)((adminUser === null || adminUser === void 0 ? void 0 : adminUser.id) || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated department restrictions for user #${userId}`);
        res.json({ message: 'Department restrictions updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update department restrictions' });
    }
});
// Update module permissions for an admin or employee
router.put('/:userId/permissions', async (req, res) => {
    const { userId } = req.params;
    const { permissions } = req.body;
    try {
        await prismaClient_1.default.user.update({
            where: { id: Number(userId) },
            data: { permissions }
        });
        const adminUser = req.user;
        await (0, activityLogger_1.logActivity)((adminUser === null || adminUser === void 0 ? void 0 : adminUser.id) || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated module permissions for user #${userId}`);
        res.json({ message: 'Permissions updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update module permissions' });
    }
});
// GET references (branches and departments) for the dropdown multi-select
router.get('/references', async (req, res) => {
    try {
        const branches = await prismaClient_1.default.branch.findMany({ select: { id: true, name: true, code: true } });
        const departments = await prismaClient_1.default.department.findMany({ select: { id: true, name: true, branch: { select: { name: true } } } });
        res.json({ branches, departments });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch references' });
    }
});
exports.default = router;
//# sourceMappingURL=admin-rights.js.map