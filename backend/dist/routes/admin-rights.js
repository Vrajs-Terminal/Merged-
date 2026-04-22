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
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all admins with their restrictions
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prismaClient_1.default.user.findMany({
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
}));
// Get all employees
router.get('/employees', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield prismaClient_1.default.user.findMany({
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
}));
// Update branch restrictions for an admin
router.put('/:userId/branches', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { branchIds, isAll } = req.body; // isAll true means bypass/delete restrictions
    try {
        // Clear existing restrictions
        yield prismaClient_1.default.adminBranchRestriction.deleteMany({
            where: { user_id: Number(userId) }
        });
        if (!isAll && branchIds && Array.isArray(branchIds)) {
            // Apply new specific restrictions
            const data = branchIds.map(id => ({ user_id: Number(userId), branch_id: id }));
            if (data.length > 0) {
                yield prismaClient_1.default.adminBranchRestriction.createMany({ data });
            }
        }
        const adminUser = req.user;
        yield (0, activityLogger_1.logActivity)((adminUser === null || adminUser === void 0 ? void 0 : adminUser.id) || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated branch restrictions for user #${userId}`);
        res.json({ message: 'Branch restrictions updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update branch restrictions' });
    }
}));
// Update department restrictions for an admin
router.put('/:userId/departments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { departmentIds, isAll } = req.body;
    try {
        // Clear existing restrictions
        yield prismaClient_1.default.adminDepartmentRestriction.deleteMany({
            where: { user_id: Number(userId) }
        });
        if (!isAll && departmentIds && Array.isArray(departmentIds)) {
            // Apply new specific restrictions
            const data = departmentIds.map(id => ({ user_id: Number(userId), department_id: id }));
            if (data.length > 0) {
                yield prismaClient_1.default.adminDepartmentRestriction.createMany({ data });
            }
        }
        const adminUser = req.user;
        yield (0, activityLogger_1.logActivity)((adminUser === null || adminUser === void 0 ? void 0 : adminUser.id) || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated department restrictions for user #${userId}`);
        res.json({ message: 'Department restrictions updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update department restrictions' });
    }
}));
// Update module permissions for an admin or employee
router.put('/:userId/permissions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { permissions } = req.body;
    try {
        yield prismaClient_1.default.user.update({
            where: { id: Number(userId) },
            data: { permissions }
        });
        const adminUser = req.user;
        yield (0, activityLogger_1.logActivity)((adminUser === null || adminUser === void 0 ? void 0 : adminUser.id) || null, 'UPDATED', 'ADMIN_RIGHTS', `Updated module permissions for user #${userId}`);
        res.json({ message: 'Permissions updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update module permissions' });
    }
}));
// GET references (branches and departments) for the dropdown multi-select
router.get('/references', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branches = yield prismaClient_1.default.branch.findMany({ select: { id: true, name: true, code: true } });
        const departments = yield prismaClient_1.default.department.findMany({ select: { id: true, name: true, branch: { select: { name: true } } } });
        res.json({ branches, departments });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch references' });
    }
}));
exports.default = router;
