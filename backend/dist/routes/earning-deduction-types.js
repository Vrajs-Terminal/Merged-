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
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = express_1.default.Router();
// GET / — List all earning/deduction types (with optional type filter)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, status } = req.query;
        const where = {};
        if (type && (type === 'Earning' || type === 'Deduction')) {
            where.type = type;
        }
        if (status && (status === 'Active' || status === 'Inactive')) {
            where.status = status;
        }
        const items = yield prismaClient_1.default.earningDeductionType.findMany({
            where,
            orderBy: [{ type: 'asc' }, { name: 'asc' }]
        });
        res.json(items);
    }
    catch (error) {
        console.error("Error fetching earning/deduction types:", error);
        res.status(500).json({ error: "Failed to fetch earning/deduction types" });
    }
}));
// GET /:id — Get single earning/deduction type
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield prismaClient_1.default.earningDeductionType.findUnique({
            where: { id: parseInt(id) }
        });
        if (!item) {
            return res.status(404).json({ error: "Component not found" });
        }
        res.json(item);
    }
    catch (error) {
        console.error("Error fetching component:", error);
        res.status(500).json({ error: "Failed to fetch component" });
    }
}));
// POST / — Create new earning/deduction type
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, taxable, description, status } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: "Name and Type are required" });
        }
        if (type !== 'Earning' && type !== 'Deduction') {
            return res.status(400).json({ error: "Type must be 'Earning' or 'Deduction'" });
        }
        const existing = yield prismaClient_1.default.earningDeductionType.findUnique({
            where: { name }
        });
        if (existing) {
            return res.status(409).json({ error: `Component '${name}' already exists` });
        }
        const item = yield prismaClient_1.default.earningDeductionType.create({
            data: {
                name,
                type,
                taxable: taxable === true || taxable === 'true',
                description: description || null,
                status: status || 'Active'
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'EARNING_DEDUCTION_TYPE', name);
        res.status(201).json(item);
    }
    catch (error) {
        console.error("Error creating component:", error);
        res.status(500).json({ error: "Failed to create component" });
    }
}));
// PUT /:id — Update earning/deduction type
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, type, taxable, description, status } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: "Name and Type are required" });
        }
        // Check for duplicate name (exclude self)
        const existing = yield prismaClient_1.default.earningDeductionType.findFirst({
            where: {
                name,
                NOT: { id: parseInt(id) }
            }
        });
        if (existing) {
            return res.status(409).json({ error: `Component '${name}' already exists` });
        }
        const item = yield prismaClient_1.default.earningDeductionType.update({
            where: { id: parseInt(id) },
            data: {
                name,
                type,
                taxable: taxable === true || taxable === 'true',
                description: description || null,
                status: status || 'Active'
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'EARNING_DEDUCTION_TYPE', name);
        res.json(item);
    }
    catch (error) {
        console.error("Error updating component:", error);
        res.status(500).json({ error: "Failed to update component" });
    }
}));
// DELETE /:id — Delete earning/deduction type
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if used in any salary group
        const usageCount = yield prismaClient_1.default.salaryGroupComponent.count({
            where: { earning_deduction_type_id: parseInt(id) }
        });
        if (usageCount > 0) {
            return res.status(400).json({
                error: `Cannot delete: This component is used in ${usageCount} salary group(s). Remove it from salary groups first.`
            });
        }
        const item = yield prismaClient_1.default.earningDeductionType.delete({
            where: { id: parseInt(id) }
        });
        yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'EARNING_DEDUCTION_TYPE', item.name);
        res.json({ message: "Component deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting component:", error);
        res.status(500).json({ error: "Failed to delete component" });
    }
}));
// PATCH /:id/toggle — Toggle Active/Inactive status
router.patch('/:id/toggle', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield prismaClient_1.default.earningDeductionType.findUnique({
            where: { id: parseInt(id) }
        });
        if (!item) {
            return res.status(404).json({ error: "Component not found" });
        }
        const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prismaClient_1.default.earningDeductionType.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'EARNING_DEDUCTION_TYPE', `${item.name} → ${newStatus}`);
        res.json(updated);
    }
    catch (error) {
        console.error("Error toggling status:", error);
        res.status(500).json({ error: "Failed to toggle status" });
    }
}));
exports.default = router;
// Triggering IDE re-scan
