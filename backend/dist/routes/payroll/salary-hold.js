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
// GET / - List hold requests with filters
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branch_id, department_id, employee_id, month, year, status } = req.query;
        const where = {};
        if (month)
            where.month = parseInt(month);
        if (year)
            where.year = parseInt(year);
        if (status)
            where.status = status;
        if (employee_id)
            where.employee_id = parseInt(employee_id);
        if (branch_id || department_id) {
            where.employee = {};
            if (branch_id)
                where.employee.branch_id = parseInt(branch_id);
            if (department_id)
                where.employee.department_id = parseInt(department_id);
        }
        const records = yield prismaClient_1.default.salaryHoldRequest.findMany({
            where,
            include: {
                employee: {
                    select: {
                        name: true,
                        branch: { select: { name: true } },
                        department: { select: { name: true } }
                    }
                },
                reportingUser: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(records);
    }
    catch (error) {
        console.error("Fetch Salary Hold Requests Error:", error);
        res.status(500).json({ error: "Failed to fetch salary hold requests", details: error.message });
    }
}));
// POST / - Create new hold request
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { employee_id, month, year, start_date, end_date, reason } = req.body;
        if (!employee_id || !month || !year || !start_date || !end_date || !reason) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const record = yield prismaClient_1.default.salaryHoldRequest.create({
            data: {
                employee_id: parseInt(employee_id),
                reporting_user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1,
                month: parseInt(month),
                year: parseInt(year),
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                reason,
                status: 'Pending'
            }
        });
        yield (0, activityLogger_1.logActivity)(((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || null, 'ADDED', 'SALARY_HOLD_REQUEST', `Employee ID: ${employee_id}, Period: ${month}/${year}`);
        res.status(201).json(record);
    }
    catch (error) {
        console.error("Create Salary Hold Request Error:", error);
        res.status(500).json({ error: "Failed to create hold request", details: error.message });
    }
}));
// PATCH /:id/status - Approve, Reject, or Mark as Processed
router.patch('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const record = yield prismaClient_1.default.salaryHoldRequest.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        yield (0, activityLogger_1.logActivity)(null, 'STATUS_UPDATED', 'SALARY_HOLD_REQUEST', `ID: ${id}, Status: ${status}`);
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
}));
// DELETE /:id - Delete request
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const record = yield prismaClient_1.default.salaryHoldRequest.findUnique({ where: { id: parseInt(id) } });
        if ((record === null || record === void 0 ? void 0 : record.status) === 'Processed') {
            return res.status(400).json({ error: "Cannot delete a processed hold request" });
        }
        yield prismaClient_1.default.salaryHoldRequest.delete({ where: { id: parseInt(id) } });
        yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'SALARY_HOLD_REQUEST', `ID: ${id}`);
        res.json({ message: "Request deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete request" });
    }
}));
exports.default = router;
