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
// GET all access rules
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rules = yield prismaClient_1.default.workAllocationAccess.findMany({
            include: {
                assignBy: { select: { id: true, name: true, role: true, employeeGrade: { select: { name: true } }, designation: { select: { name: true } } } },
                assignTo: { select: { id: true, name: true, role: true, employeeGrade: { select: { name: true } }, designation: { select: { name: true } } } },
            },
            orderBy: { createdAt: 'desc' }
        });
        // Enhance rules with category names based on IDs
        const categoryIdsSet = new Set();
        rules.forEach((r) => {
            const arr = Array.isArray(r.category_ids) ? r.category_ids : [];
            arr.forEach((id) => categoryIdsSet.add(id));
        });
        const catIds = Array.from(categoryIdsSet);
        const categories = yield prismaClient_1.default.workCategory.findMany({
            where: { id: { in: catIds } },
            select: { id: true, name: true, code: true }
        });
        const enhancedRules = rules.map((r) => {
            const arr = Array.isArray(r.category_ids) ? r.category_ids : [];
            const mappedCats = arr.map((catReqId) => categories.find((c) => c.id === catReqId)).filter(Boolean);
            return Object.assign(Object.assign({}, r), { categories: mappedCats });
        });
        res.status(200).json(enhancedRules);
    }
    catch (error) {
        console.error('Fetch access error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST new access rule
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { assign_by_id, assign_to_id, category_ids, access_type, max_task_per_day, max_task_per_employee, allow_reassign, approval_required, status } = req.body;
        if (!assign_by_id || !assign_to_id || !category_ids) {
            return res.status(400).json({ message: 'assign_by_id, assign_to_id and category_ids are required' });
        }
        if (assign_by_id === assign_to_id) {
            return res.status(400).json({ message: 'User cannot assign to themselves.' });
        }
        // Check for duplicates
        const existing = yield prismaClient_1.default.workAllocationAccess.findFirst({
            where: { assign_by_id: Number(assign_by_id), assign_to_id: Number(assign_to_id) }
        });
        if (existing) {
            return res.status(400).json({ message: 'Access Rule already exists for this mapping. Please edit the existing one.' });
        }
        // Check for circular assignment
        const circular = yield prismaClient_1.default.workAllocationAccess.findFirst({
            where: { assign_by_id: Number(assign_to_id), assign_to_id: Number(assign_by_id) }
        });
        if (circular) {
            return res.status(400).json({ message: 'Circular assignment detected (assignTo is already assigning to assignBy).' });
        }
        const rule = yield prismaClient_1.default.workAllocationAccess.create({
            data: {
                assign_by_id: Number(assign_by_id),
                assign_to_id: Number(assign_to_id),
                category_ids, // Requires JSON array [1, 2, 3] etc
                access_type: access_type || 'Full',
                max_task_per_day: max_task_per_day ? Number(max_task_per_day) : 0,
                max_task_per_employee: max_task_per_employee ? Number(max_task_per_employee) : 0,
                allow_reassign: typeof allow_reassign === 'boolean' ? allow_reassign : false,
                approval_required: typeof approval_required === 'boolean' ? approval_required : false,
                status: status || 'Active',
            }
        });
        res.status(201).json(rule);
    }
    catch (error) {
        console.error('Create access rule error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { category_ids, access_type, max_task_per_day, max_task_per_employee, allow_reassign, approval_required, status } = req.body;
        const updated = yield prismaClient_1.default.workAllocationAccess.update({
            where: { id: Number(id) },
            data: {
                category_ids,
                access_type,
                max_task_per_day: max_task_per_day !== undefined ? Number(max_task_per_day) : undefined,
                max_task_per_employee: max_task_per_employee !== undefined ? Number(max_task_per_employee) : undefined,
                allow_reassign: allow_reassign !== undefined ? allow_reassign : undefined,
                approval_required: approval_required !== undefined ? approval_required : undefined,
                status
            }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error('Update access rule error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.workAllocationAccess.update({
            where: { id: Number(id) },
            data: { status: 'Inactive' }
        });
        res.status(200).json({ message: 'Access Rule deactivated' });
    }
    catch (error) {
        console.error('Delete access rule error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
