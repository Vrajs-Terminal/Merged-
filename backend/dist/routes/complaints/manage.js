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
const router = express_1.default.Router();
// GET all complaints
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, category_id, branch_id, start_date, end_date } = req.query;
        const where = {};
        if (status && status !== 'All')
            where.status = String(status);
        if (category_id)
            where.category_id = Number(category_id);
        if (branch_id)
            where.branch_id = Number(branch_id);
        if (start_date || end_date) {
            where.createdAt = {};
            if (start_date)
                where.createdAt.gte = new Date(String(start_date) + 'T00:00:00Z');
            if (end_date)
                where.createdAt.lte = new Date(String(end_date) + 'T23:59:59Z');
        }
        const complaints = yield prismaClient_1.default.complaint.findMany({
            where,
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true, sla_limit: true } },
                assignee: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(complaints);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST create complaint
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, category_id, title, description, priority, is_anonymous } = req.body;
        if (!user_id || !category_id || !title || !description) {
            return res.status(400).json({ message: 'User, Category, Title, and Description are required' });
        }
        // Get employee details
        const employee = yield prismaClient_1.default.user.findUnique({
            where: { id: Number(user_id) },
            select: { branch_id: true, department_id: true }
        });
        // Generate Complaint No (CMP-YYYY-XXXX)
        const count = yield prismaClient_1.default.complaint.count();
        const year = new Date().getFullYear();
        const complaint_no = `CMP-${year}-${String(count + 1).padStart(4, '0')}`;
        const complaint = yield prismaClient_1.default.complaint.create({
            data: {
                complaint_no,
                user_id: Number(user_id),
                category_id: Number(category_id),
                branch_id: employee === null || employee === void 0 ? void 0 : employee.branch_id,
                department_id: employee === null || employee === void 0 ? void 0 : employee.department_id,
                title,
                description,
                priority: priority || 'Medium',
                is_anonymous: Boolean(is_anonymous)
            }
        });
        res.status(201).json(complaint);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PUT update status/assignment
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { status, assigned_to, rating } = req.body;
        const updated = yield prismaClient_1.default.complaint.update({
            where: { id },
            data: {
                status,
                assigned_to: assigned_to ? Number(assigned_to) : undefined,
                rating: rating ? Number(rating) : undefined
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// GET Dash Stats
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all = yield prismaClient_1.default.complaint.count();
        const open = yield prismaClient_1.default.complaint.count({ where: { status: 'Open' } });
        const closed = yield prismaClient_1.default.complaint.count({ where: { status: 'Closed' } });
        const reopened = yield prismaClient_1.default.complaint.count({ where: { status: 'Re-Open' } });
        res.json({ all, open, closed, reopened });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
