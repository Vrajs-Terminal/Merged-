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
exports.toggleCustomerCategoryStatus = exports.deleteCustomerCategory = exports.updateCustomerCategory = exports.createCustomerCategory = exports.getCustomerCategory = exports.getAllCustomerCategories = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all customer categories
const getAllCustomerCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 25, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search)
            where.name = { contains: search };
        const [categories, total] = yield Promise.all([
            prismaClient_1.default.customerCategory.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    subCategories: {
                        select: { id: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.customerCategory.count({ where })
        ]);
        const categoriesWithCounts = yield Promise.all(categories.map((cat) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, cat), { subCategoryCount: cat.subCategories.length }));
        })));
        res.json({
            success: true,
            data: categoriesWithCounts,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching customer categories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch customer categories' });
    }
});
exports.getAllCustomerCategories = getAllCustomerCategories;
// Get single customer category
const getCustomerCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield prismaClient_1.default.customerCategory.findUnique({
            where: { id: parseInt(id) },
            include: { subCategories: true }
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Customer category not found' });
        }
        res.json({ success: true, data: category });
    }
    catch (error) {
        console.error('Error fetching customer category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch customer category' });
    }
});
exports.getCustomerCategory = getCustomerCategory;
// Create customer category
const createCustomerCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status = 'Active' } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }
        const category = yield prismaClient_1.default.customerCategory.create({
            data: {
                name,
                description,
                status
            }
        });
        res.status(201).json({ success: true, data: category, message: 'Customer category created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Customer category name already exists' });
        }
        console.error('Error creating customer category:', error);
        res.status(500).json({ success: false, message: 'Failed to create customer category' });
    }
});
exports.createCustomerCategory = createCustomerCategory;
// Update customer category
const updateCustomerCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const category = yield prismaClient_1.default.customerCategory.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign(Object.assign({}, (name && { name })), (description && { description })), (status && { status }))
        });
        res.json({ success: true, data: category, message: 'Customer category updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Customer category not found' });
        }
        console.error('Error updating customer category:', error);
        res.status(500).json({ success: false, message: 'Failed to update customer category' });
    }
});
exports.updateCustomerCategory = updateCustomerCategory;
// Delete customer category
const deleteCustomerCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.customerCategory.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Customer category deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Customer category not found' });
        }
        console.error('Error deleting customer category:', error);
        res.status(500).json({ success: false, message: 'Failed to delete customer category' });
    }
});
exports.deleteCustomerCategory = deleteCustomerCategory;
// Toggle status
const toggleCustomerCategoryStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield prismaClient_1.default.customerCategory.findUnique({
            where: { id: parseInt(id) }
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Customer category not found' });
        }
        const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prismaClient_1.default.customerCategory.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Customer category status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling customer category status:', error);
        res.status(500).json({ success: false, message: 'Failed to update customer category status' });
    }
});
exports.toggleCustomerCategoryStatus = toggleCustomerCategoryStatus;
