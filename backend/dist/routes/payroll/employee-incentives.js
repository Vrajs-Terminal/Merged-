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
// GET / - List incentives with filters
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branch_id, department_id, user_id, month, year, status, incentive_type_id } = req.query;
        const where = {};
        if (month)
            where.month = parseInt(month);
        if (year)
            where.year = parseInt(year);
        if (status)
            where.status = status;
        if (incentive_type_id)
            where.incentive_type_id = parseInt(incentive_type_id);
        if (user_id)
            where.user_id = parseInt(user_id);
        if (branch_id || department_id) {
            where.user = {};
            if (branch_id)
                where.user.branch_id = parseInt(branch_id);
            if (department_id)
                where.user.department_id = parseInt(department_id);
        }
        const records = yield prismaClient_1.default.employeeIncentiveDetail.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        branch: { select: { name: true } },
                        department: { select: { name: true } }
                    }
                },
                incentiveType: true,
                addedBy: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(records);
    }
    catch (error) {
        console.error("Fetch Incentives Error:", error);
        res.status(500).json({ error: "Failed to fetch incentives", details: error.message });
    }
}));
// POST / - Add new incentive
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { user_id, incentive_type_id, amount, description, month, year, status } = req.body;
        if (!user_id || !incentive_type_id || !amount || !month || !year) {
            return res.status(400).json({ error: "Missing required fields (User, Type, Amount, Month, Year)" });
        }
        const record = yield prismaClient_1.default.employeeIncentiveDetail.create({
            data: {
                user_id: parseInt(user_id),
                incentive_type_id: parseInt(incentive_type_id),
                amount: parseFloat(amount),
                description,
                month: parseInt(month),
                year: parseInt(year),
                status: status || 'Pending',
                added_by: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1
            }
        });
        yield (0, activityLogger_1.logActivity)(((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || null, 'ADDED', 'EMPLOYEE_INCENTIVE', `User ID: ${user_id}, Amount: ${amount}`);
        res.status(201).json(record);
    }
    catch (error) {
        console.error("Create Incentive Error:", error);
        res.status(500).json({ error: "Failed to create incentive", details: error.message });
    }
}));
// PATCH /:id/status - Approve or Reject
router.patch('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, approved_by } = req.body;
        const record = yield prismaClient_1.default.employeeIncentiveDetail.update({
            where: { id: parseInt(id) },
            data: {
                status,
                approved_by: status === 'Approved' ? (approved_by || 1) : null,
                approved_at: status === 'Approved' ? new Date() : null
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'STATUS_UPDATED', 'EMPLOYEE_INCENTIVE', `ID: ${id}, Status: ${status}`);
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
}));
// DELETE /:id - Delete incentive
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const record = yield prismaClient_1.default.employeeIncentiveDetail.findUnique({ where: { id: parseInt(id) } });
        if ((record === null || record === void 0 ? void 0 : record.status) === 'Paid') {
            return res.status(400).json({ error: "Cannot delete an incentive that has already been paid" });
        }
        yield prismaClient_1.default.employeeIncentiveDetail.delete({ where: { id: parseInt(id) } });
        yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'EMPLOYEE_INCENTIVE', `ID: ${id}`);
        res.json({ message: "Incentive deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete incentive" });
    }
}));
exports.default = router;
