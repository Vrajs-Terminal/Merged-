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
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const activityLogger_1 = require("../../services/activityLogger");
const router = express_1.default.Router();
// GET / — List all current employee CTCs with filters
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branch_id, department_id, search } = req.query;
        const where = {
            status: 'Current'
        };
        if (branch_id)
            where.user = Object.assign(Object.assign({}, where.user), { branch_id: parseInt(branch_id) });
        if (department_id)
            where.user = Object.assign(Object.assign({}, where.user), { department_id: parseInt(department_id) });
        if (search) {
            where.user = Object.assign(Object.assign({}, where.user), { OR: [
                    { name: { contains: search } },
                    { email: { contains: search } }
                ] });
        }
        const ctcs = yield prismaClient_1.default.employeeCTC.findMany({
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
}));
// GET /users-list — List employees for dropdown (those without current CTC or all active)
router.get('/users-list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prismaClient_1.default.user.findMany({
            where: { role: { not: 'Superadmin' } },
            select: { id: true, name: true, email: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
}));
// POST / — Assign new CTC (marks previous as "Previous")
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, salary_group_id, salary_type, gross_salary, increment_remark, start_date, next_increment_date } = req.body;
        if (!user_id || !salary_group_id || !gross_salary || !start_date) {
            return res.status(400).json({ error: "Required fields are missing" });
        }
        // Use transaction to update old and create new
        const result = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Mark existing CTC as 'Previous'
            yield tx.employeeCTC.updateMany({
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
        }));
        yield (0, activityLogger_1.logActivity)(null, 'ASSIGNED', 'CTC', `User ID: ${user_id}`);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error assigning CTC:", error);
        res.status(500).json({ error: "Failed to assign CTC" });
    }
}));
// GET /history/:user_id — Get CTC history for an employee
router.get('/history/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield prismaClient_1.default.employeeCTC.findMany({
            where: { user_id: parseInt(req.params.user_id) },
            include: { salaryGroup: { select: { name: true } } },
            orderBy: { start_date: 'desc' }
        });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
}));
// PUT /:id — Update CTC record
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { salary_group_id, salary_type, gross_salary, increment_remark, start_date, next_increment_date, status } = req.body;
        const updated = yield prismaClient_1.default.employeeCTC.update({
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
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'CTC', `Record ID: ${id}`);
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating CTC:", error);
        res.status(500).json({ error: "Failed to update CTC" });
    }
}));
// DELETE /:id — Delete CTC record
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const target = yield prismaClient_1.default.employeeCTC.delete({
            where: { id: parseInt(id) }
        });
        yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'CTC', `Record ID: ${id} for User ID: ${target.user_id}`);
        res.json({ message: "CTC record deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting CTC:", error);
        res.status(500).json({ error: "Failed to delete CTC" });
    }
}));
exports.default = router;
