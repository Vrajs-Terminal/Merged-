"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all employee grades
router.get('/', async (req, res) => {
    try {
        const grades = await prismaClient_1.default.employeeGrade.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(grades);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee grades' });
    }
});
// Create Employee Grade
router.post('/', async (req, res) => {
    const { name, code, status } = req.body;
    if (!name)
        return res.status(400).json({ error: 'Name is required' });
    try {
        const grade = await prismaClient_1.default.employeeGrade.create({
            data: {
                name,
                code,
                status: status || 'Active'
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'CREATED', 'EMPLOYEE_GRADE', grade.name);
        res.status(201).json(grade);
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ error: 'Grade code must be unique' });
        res.status(500).json({ error: 'Failed to create grade' });
    }
});
// Update Employee Grade
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, code, status } = req.body;
    try {
        const grade = await prismaClient_1.default.employeeGrade.update({
            where: { id: Number(id) },
            data: { name, code, status }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'EMPLOYEE_GRADE', grade.name);
        res.json(grade);
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ error: 'Grade code must be unique' });
        res.status(500).json({ error: 'Failed to update grade' });
    }
});
// Delete Employee Grade
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const linkedUsers = await prismaClient_1.default.user.count({ where: { employee_grade_id: Number(id) } });
        if (linkedUsers > 0) {
            return res.status(400).json({ error: 'Cannot delete: Employees are actively assigned to this grade.' });
        }
        await prismaClient_1.default.employeeGrade.delete({ where: { id: Number(id) } });
        await (0, activityLogger_1.logActivity)(null, 'DELETED', 'EMPLOYEE_GRADE', `Grade #${id}`);
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete grade' });
    }
});
// Assign Employee Grade and Update History
router.post('/assign', async (req, res) => {
    // Expected payload: { user_id: 1, new_grade_id: 2, effective_from: "2023-10-01", remarks: "Promotion" }
    const { user_id, new_grade_id, effective_from, remarks } = req.body;
    if (!user_id || !new_grade_id || !effective_from) {
        return res.status(400).json({ error: 'Missing required fields: user_id, new_grade_id, effective_from' });
    }
    try {
        await prismaClient_1.default.$transaction(async (tx) => {
            // 1. Close out any currently active grade history for this user
            await tx.employeeGradeHistory.updateMany({
                where: {
                    user_id: Number(user_id),
                    status: 'Active'
                },
                data: {
                    effective_to: new Date(effective_from),
                    status: 'Closed'
                }
            });
            // 2. Create the new history record
            await tx.employeeGradeHistory.create({
                data: {
                    user_id: Number(user_id),
                    grade_id: Number(new_grade_id),
                    effective_from: new Date(effective_from),
                    remarks: remarks || null,
                    status: 'Active'
                }
            });
            // 3. Update the user's current grade_id directly on the User model
            await tx.user.update({
                where: { id: Number(user_id) },
                data: { employee_grade_id: Number(new_grade_id) }
            });
        });
        await (0, activityLogger_1.logActivity)(null, 'ASSIGNED', 'EMPLOYEE_GRADE', `Assigned Grade ${new_grade_id} to User ${user_id}`);
        res.status(200).json({ message: 'Grade assigned successfully and history updated.' });
    }
    catch (error) {
        console.error("Error assigning grade:", error);
        res.status(500).json({ error: 'Failed to assign employee grade.' });
    }
});
// Fetch Grade History for a specific User
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const history = await prismaClient_1.default.employeeGradeHistory.findMany({
            where: { user_id: Number(userId) },
            include: {
                grade: true, // Fetch the related Grade object to show the name
            },
            orderBy: {
                effective_from: 'desc'
            }
        });
        res.json(history);
    }
    catch (error) {
        console.error("Error fetching grade history:", error);
        res.status(500).json({ error: 'Failed to fetch grade history.' });
    }
});
exports.default = router;
//# sourceMappingURL=employee-grades.js.map