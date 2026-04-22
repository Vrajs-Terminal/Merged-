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
// GET all categories
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prismaClient_1.default.vehicleCategory.findMany({
            include: {
                createdBy: { select: { id: true, name: true } },
                _count: { select: { vehicles: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(categories);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST create category
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status, created_by_id } = req.body;
        if (!(name === null || name === void 0 ? void 0 : name.trim()))
            return res.status(400).json({ message: 'Category name is required' });
        // Check duplicate name
        const existing = yield prismaClient_1.default.vehicleCategory.findFirst({
            where: { name: { equals: name.trim() } }
        });
        if (existing)
            return res.status(409).json({ message: 'Category with this name already exists' });
        const category = yield prismaClient_1.default.vehicleCategory.create({
            data: {
                name: name.trim(),
                description: description || null,
                status: status || 'Active',
                createdById: created_by_id ? Number(created_by_id) : null
            }
        });
        res.status(201).json(category);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PUT update category
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status } = req.body;
        if (!(name === null || name === void 0 ? void 0 : name.trim()))
            return res.status(400).json({ message: 'Category name is required' });
        const updated = yield prismaClient_1.default.vehicleCategory.update({
            where: { id: Number(req.params.id) },
            data: { name: name.trim(), description: description || null, status }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PATCH toggle status
router.patch('/:id/toggle', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cat = yield prismaClient_1.default.vehicleCategory.findUnique({ where: { id: Number(req.params.id) } });
        if (!cat)
            return res.status(404).json({ message: 'Category not found' });
        const updated = yield prismaClient_1.default.vehicleCategory.update({
            where: { id: cat.id },
            data: { status: cat.status === 'Active' ? 'Inactive' : 'Active' }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// DELETE category
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if vehicles exist under this category
        const count = yield prismaClient_1.default.employeeVehicle.count({ where: { categoryId: Number(req.params.id) } });
        if (count > 0)
            return res.status(400).json({ message: `Cannot delete: ${count} vehicle(s) are using this category` });
        yield prismaClient_1.default.vehicleCategory.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Category deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
