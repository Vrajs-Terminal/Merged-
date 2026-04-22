"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const activityLogger_1 = require("../../services/activityLogger");
const router = express_1.default.Router();
// GET / — List all current employee CTCs with filters
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, search } = req.query;
        const where = {
            status: 'Current'
        };
        if (branch_id)
            where.user = { ...where.user, branch_id: parseInt(branch_id) };
        if (department_id)
            where.user = { ...where.user, department_id: parseInt(department_id) };
        if (search) {
            where.user = {
                ...where.user,
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } }
                ]
            };
        }
        const ctcs = await prismaClient_1.default.employeeCTC.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        branch: { select: { name: true } },
                        department: { select: { name: true } }
                    }
                },
                salaryGroup: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ctcs);
    }
    catch (error) {
        console.error("Error fetching employee CTCs:", error);
        res.status(500).json({ error: "Failed to fetch employee CTCs" });
    }
});
// GET /users-list — List employees for dropdown (those without current CTC or all active)
router.get('/users-list', async (req, res) => {
    try {
        const users = await prismaClient_1.default.user.findMany({
            where: { role: { not: 'Superadmin' } },
            select: { id: true, name: true, email: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
// POST / — Assign new CTC (marks previous as "Previous")
router.post('/', async (req, res) => {
    try {
        const { user_id, salary_group_id, salary_type, gross_salary, increment_remark, start_date, next_increment_date } = req.body;
        if (!user_id || !salary_group_id || !gross_salary || !start_date) {
            return res.status(400).json({ error: "Required fields are missing" });
        }
        // Use transaction to update old and create new
        const result = await prismaClient_1.default.$transaction(async (tx) => {
            // Mark existing CTC as 'Previous'
            await tx.employeeCTC.updateMany({
                where: { user_id: parseInt(user_id), status: 'Current' },
                data: { status: 'Previous' }
            });
            // Create new CTC
            return tx.employeeCTC.create({
                data: {
                    user_id: parseInt(user_id),
                    salary_group_id: parseInt(salary_group_id),
                    salary_type,
                    gross_salary: parseFloat(gross_salary),
                    increment_remark,
                    start_date: new Date(start_date),
                    next_increment_date: next_increment_date ? new Date(next_increment_date) : null,
                    status: 'Current'
                }
            });
        });
        await (0, activityLogger_1.logActivity)(null, 'ASSIGNED', 'CTC', `User ID: ${user_id}`);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error assigning CTC:", error);
        res.status(500).json({ error: "Failed to assign CTC" });
    }
});
// GET /history/:user_id — Get CTC history for an employee
router.get('/history/:user_id', async (req, res) => {
    try {
        const history = await prismaClient_1.default.employeeCTC.findMany({
            where: { user_id: parseInt(req.params.user_id) },
            include: { salaryGroup: { select: { name: true } } },
            orderBy: { start_date: 'desc' }
        });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});
// PUT /:id — Update CTC record
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { salary_group_id, salary_type, gross_salary, increment_remark, start_date, next_increment_date, status } = req.body;
        const updated = await prismaClient_1.default.employeeCTC.update({
            where: { id: parseInt(id) },
            data: {
                salary_group_id: salary_group_id ? parseInt(salary_group_id) : undefined,
                salary_type,
                gross_salary: gross_salary ? parseFloat(gross_salary) : undefined,
                increment_remark,
                start_date: start_date ? new Date(start_date) : undefined,
                next_increment_date: next_increment_date ? new Date(next_increment_date) : null,
                status
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'CTC', `Record ID: ${id}`);
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating CTC:", error);
        res.status(500).json({ error: "Failed to update CTC" });
    }
});
// DELETE /:id — Delete CTC record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const target = await prismaClient_1.default.employeeCTC.delete({
            where: { id: parseInt(id) }
        });
        await (0, activityLogger_1.logActivity)(null, 'DELETED', 'CTC', `Record ID: ${id} for User ID: ${target.user_id}`);
        res.json({ message: "CTC record deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting CTC:", error);
        res.status(500).json({ error: "Failed to delete CTC" });
    }
});
exports.default = router;
//# sourceMappingURL=employee-ctc.js.map