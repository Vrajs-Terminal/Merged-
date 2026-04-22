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
exports.toggleProductStatus = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getAllProducts = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all products
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [products, total] = yield Promise.all([
            prismaClient_1.default.product.findMany({
                where,
                skip,
                take: limitNum,
                include: { category: true, subCategory: true },
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.product.count({ where })
        ]);
        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});
exports.getAllProducts = getAllProducts;
// Get single product
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prismaClient_1.default.product.findUnique({
            where: { id: parseInt(id) },
            include: { category: true, subCategory: true, variants: true }
        });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
});
exports.getProduct = getProduct;
// Create product
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, categoryId, subCategoryId, hsnCode, description, status = 'Active' } = req.body;
        if (!name || !categoryId) {
            return res.status(400).json({ success: false, message: 'Product name and categoryId are required' });
        }
        const product = yield prismaClient_1.default.product.create({
            data: {
                name,
                categoryId: parseInt(categoryId),
                subCategoryId: subCategoryId ? parseInt(subCategoryId) : undefined,
                hsnCode,
                description,
                status
            },
            include: { category: true, subCategory: true }
        });
        res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Product name already exists' });
        }
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
});
exports.createProduct = createProduct;
// Update product
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, categoryId, subCategoryId, hsnCode, description, status } = req.body;
        const product = yield prismaClient_1.default.product.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (categoryId && { categoryId: parseInt(categoryId) })), (subCategoryId && { subCategoryId: parseInt(subCategoryId) })), (hsnCode && { hsnCode })), (description && { description })), (status && { status })),
            include: { category: true, subCategory: true }
        });
        res.json({ success: true, data: product, message: 'Product updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
});
exports.updateProduct = updateProduct;
// Delete product
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.product.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});
exports.deleteProduct = deleteProduct;
// Toggle status
const toggleProductStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prismaClient_1.default.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const newStatus = product.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prismaClient_1.default.product.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Product status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling product status:', error);
        res.status(500).json({ success: false, message: 'Failed to update product status' });
    }
});
exports.toggleProductStatus = toggleProductStatus;
