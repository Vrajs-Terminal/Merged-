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
exports.toggleCategoryStatus = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.getAllCategories = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all product categories with pagination
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 25, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const where = search ? {
            name: { contains: search }
        } : undefined;
        const [categories, total] = yield Promise.all([
            prismaClient_1.default.productCategory.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.productCategory.count({ where })
        ]);
        res.json({
            success: true,
            data: categories,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});
exports.getAllCategories = getAllCategories;
// Get single category
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield prismaClient_1.default.productCategory.findUnique({
            where: { id: parseInt(id) },
            include: { products: true, subCategories: true }
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, data: category });
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch category' });
    }
});
exports.getCategory = getCategory;
// Create category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status = 'Active' } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }
        const category = yield prismaClient_1.default.productCategory.create({
            data: {
                name,
                description,
                status
            }
        });
        res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Category name already exists' });
        }
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
});
exports.createCategory = createCategory;
// Update category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const category = yield prismaClient_1.default.productCategory.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign(Object.assign({}, (name && { name })), (description && { description })), (status && { status }))
        });
        res.json({ success: true, data: category, message: 'Category updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Failed to update category' });
    }
});
exports.updateCategory = updateCategory;
// Delete category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.productCategory.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Category deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
});
exports.deleteCategory = deleteCategory;
// Toggle status
const toggleCategoryStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield prismaClient_1.default.productCategory.findUnique({
            where: { id: parseInt(id) }
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prismaClient_1.default.productCategory.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Category status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling category status:', error);
        res.status(500).json({ success: false, message: 'Failed to update category status' });
    }
});
exports.toggleCategoryStatus = toggleCategoryStatus;
