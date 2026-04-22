"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all Sub-Departments
router.get('/', async (req, res) => {
    try {
        const subDepts = await prismaClient_1.default.subDepartment.findMany({
            orderBy: { order_index: 'asc' },
            include: { department: true }
        });
        res.json(subDepts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch sub-departments' });
    }
});
// Bulk Create Sub-Departments
router.post('/bulk', async (req, res) => {
    const { department_id, names } = req.body;
    if (!department_id || !names || !Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ error: 'Department ID and valid array of names are required' });
    }
    try {
        const dId = parseInt(department_id);
        // Find current max order for THIS specific department
        const currentMax = await prismaClient_1.default.subDepartment.aggregate({
            where: { department_id: dId },
            _max: { order_index: true }
        });
        const startIndex = (currentMax._max.order_index || 0) + 1;
        const dataToInsert = names.map((name, i) => ({
            name: name.trim(),
            department_id: dId,
            order_index: startIndex + i
        }));
        await prismaClient_1.default.subDepartment.createMany({
            data: dataToInsert,
            skipDuplicates: true // Will skip if unique constraint (name + dept) fails
        });
        const user = req.user;
        await Promise.all(names.map((n) => (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'CREATED', 'SUB_DEPARTMENT', n.trim())));
        res.status(201).json({ message: 'Sub-Departments created successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create sub-departments' });
    }
});
// Update a Sub-Department (Edit Name)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!(name === null || name === void 0 ? void 0 : name.trim()))
        return res.status(400).json({ error: 'Name is required' });
    try {
        const updated = await prismaClient_1.default.subDepartment.update({
            where: { id: parseInt(id) },
            data: { name: name.trim() }
        });
        const user = req.user;
        await (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'UPDATED', 'SUB_DEPARTMENT', updated.name);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update sub-department' });
    }
});
// Bulk Reorder Sub-Departments (Within a specific Department)
router.put('/action/reorder', async (req, res) => {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'Invalid order array' });
    }
    try {
        const transaction = orderedIds.map((id, index) => prismaClient_1.default.subDepartment.update({
            where: { id },
            data: { order_index: index }
        }));
        const user = req.user;
        await prismaClient_1.default.$transaction(transaction);
        await (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'REORDERED', 'SUB_DEPARTMENT', 'Reordered sub-departments');
        res.json({ message: 'Reordered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reorder sub-departments' });
    }
});
// Delete a Sub-Department
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const subDept = await prismaClient_1.default.subDepartment.findUnique({
            where: { id: parseInt(id) },
            include: { designations: true }
        });
        if (!subDept)
            return res.status(404).json({ error: 'Sub-Department not found' });
        // Safety check: Don't delete if it has existing Designations
        if (subDept.designations.length > 0) {
            return res.status(400).json({ error: 'Cannot delete a Sub-Department containing active Designations. Reassign them first.' });
        }
        const user = req.user;
        await prismaClient_1.default.subDepartment.delete({ where: { id: parseInt(id) } });
        await (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'DELETED', 'SUB_DEPARTMENT', subDept.name);
        res.json({ message: 'Sub-Department deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete sub-department' });
    }
});
exports.default = router;
//# sourceMappingURL=sub-departments.js.map