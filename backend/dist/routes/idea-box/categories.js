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
/**
 * GET all idea categories
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prismaClient_1.default.ideaCategory.findMany({
            include: {
                creator: { select: { id: true, name: true } },
                _count: { select: { ideas: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(categories);
    }
    catch (err) {
        console.error('Fetch Idea Categories Error:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
}));
/**
 * POST create new idea category
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status, created_by } = req.body;
        if (!(name === null || name === void 0 ? void 0 : name.trim()))
            return res.status(400).json({ error: 'Category name is required' });
        // Check uniqueness
        const existing = yield prismaClient_1.default.ideaCategory.findUnique({
            where: { name: name.trim() }
        });
        if (existing)
            return res.status(409).json({ error: 'A category with this name already exists' });
        const category = yield prismaClient_1.default.ideaCategory.create({
            data: {
                name: name.trim(),
                description: description || null,
                status: status || 'Active',
                created_by: created_by ? Number(created_by) : null
            },
            include: { creator: { select: { id: true, name: true } } }
        });
        res.status(201).json(category);
    }
    catch (err) {
        console.error('Create Idea Category Error:', err);
        res.status(500).json({ error: 'Failed to create category' });
    }
}));
/**
 * PUT update idea category
 */
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status } = req.body;
        const id = Number(req.params.id);
        if (!(name === null || name === void 0 ? void 0 : name.trim()))
            return res.status(400).json({ error: 'Category name is required' });
        // Check uniqueness for others
        const existing = yield prismaClient_1.default.ideaCategory.findFirst({
            where: {
                name: name.trim(),
                id: { not: id }
            }
        });
        if (existing)
            return res.status(409).json({ error: 'Another category with this name already exists' });
        const updated = yield prismaClient_1.default.ideaCategory.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description || null,
                status: status || 'Active'
            },
            include: { creator: { select: { id: true, name: true } } }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Update Idea Category Error:', err);
        res.status(500).json({ error: 'Failed to update category' });
    }
}));
/**
 * DELETE idea category
 */
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        // Check if ideas are linked
        const ideaCount = yield prismaClient_1.default.idea.count({
            where: { categoryId: id }
        });
        if (ideaCount > 0) {
            return res.status(400).json({ error: `Cannot delete category: ${ideaCount} idea(s) are using it.` });
        }
        yield prismaClient_1.default.ideaCategory.delete({ where: { id } });
        res.json({ success: true, message: 'Category deleted successfully' });
    }
    catch (err) {
        console.error('Delete Idea Category Error:', err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
}));
exports.default = router;
