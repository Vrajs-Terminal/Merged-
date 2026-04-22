"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCustomerSubCategoryStatus = exports.deleteCustomerSubCategory = exports.updateCustomerSubCategory = exports.createCustomerSubCategory = exports.getCustomerSubCategory = exports.getAllCustomerSubCategories = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all customer sub categories
const getAllCustomerSubCategories = async (req, res) => {
    try {
        const { page = 1, limit = 25, categoryId, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (categoryId)
            where.categoryId = parseInt(categoryId);
        if (search)
            where.name = { contains: search };
        const [subCategories, total] = await Promise.all([
            prismaClient_1.default.customerSubCategory.findMany({
                where,
                skip,
                take: limitNum,
                include: { category: true },
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.customerSubCategory.count({ where })
        ]);
        res.json({
            success: true,
            data: subCategories,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching customer sub categories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch customer sub categories' });
    }
};
exports.getAllCustomerSubCategories = getAllCustomerSubCategories;
// Get single customer sub category
const getCustomerSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategory = await prismaClient_1.default.customerSubCategory.findUnique({
            where: { id: parseInt(id) },
            include: { category: true }
        });
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Customer sub category not found' });
        }
        res.json({ success: true, data: subCategory });
    }
    catch (error) {
        console.error('Error fetching customer sub category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch customer sub category' });
    }
};
exports.getCustomerSubCategory = getCustomerSubCategory;
// Create customer sub category
const createCustomerSubCategory = async (req, res) => {
    try {
        const { categoryId, name, description, status = 'Active' } = req.body;
        if (!categoryId || !name) {
            return res.status(400).json({ success: false, message: 'categoryId and name are required' });
        }
        const subCategory = await prismaClient_1.default.customerSubCategory.create({
            data: {
                categoryId: parseInt(categoryId),
                name,
                description,
                status
            },
            include: { category: true }
        });
        res.status(201).json({ success: true, data: subCategory, message: 'Customer sub category created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Sub category with this name already exists in this category' });
        }
        console.error('Error creating customer sub category:', error);
        res.status(500).json({ success: false, message: 'Failed to create customer sub category' });
    }
};
exports.createCustomerSubCategory = createCustomerSubCategory;
// Update customer sub category
const updateCustomerSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const subCategory = await prismaClient_1.default.customerSubCategory.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(status && { status })
            },
            include: { category: true }
        });
        res.json({ success: true, data: subCategory, message: 'Customer sub category updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Customer sub category not found' });
        }
        console.error('Error updating customer sub category:', error);
        res.status(500).json({ success: false, message: 'Failed to update customer sub category' });
    }
};
exports.updateCustomerSubCategory = updateCustomerSubCategory;
// Delete customer sub category
const deleteCustomerSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.customerSubCategory.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Customer sub category deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Customer sub category not found' });
        }
        console.error('Error deleting customer sub category:', error);
        res.status(500).json({ success: false, message: 'Failed to delete customer sub category' });
    }
};
exports.deleteCustomerSubCategory = deleteCustomerSubCategory;
// Toggle status
const toggleCustomerSubCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategory = await prismaClient_1.default.customerSubCategory.findUnique({
            where: { id: parseInt(id) }
        });
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Customer sub category not found' });
        }
        const newStatus = subCategory.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prismaClient_1.default.customerSubCategory.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Customer sub category status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling customer sub category status:', error);
        res.status(500).json({ success: false, message: 'Failed to update customer sub category status' });
    }
};
exports.toggleCustomerSubCategoryStatus = toggleCustomerSubCategoryStatus;
//# sourceMappingURL=customerSubCategoryController.js.map