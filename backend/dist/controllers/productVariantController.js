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
exports.toggleVariantStatus = exports.deleteVariant = exports.updateVariant = exports.createVariant = exports.getVariant = exports.getAllVariants = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all variants
const getAllVariants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, productId, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (productId)
            where.productId = parseInt(productId);
        if (search)
            where.variantName = { contains: search };
        const [variants, total] = yield Promise.all([
            prismaClient_1.default.productVariant.findMany({
                where,
                skip,
                take: limitNum,
                include: { product: { include: { category: true } } },
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.productVariant.count({ where })
        ]);
        res.json({
            success: true,
            data: variants,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching variants:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch variants' });
    }
});
exports.getAllVariants = getAllVariants;
// Get single variant
const getVariant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const variant = yield prismaClient_1.default.productVariant.findUnique({
            where: { id: parseInt(id) },
            include: { product: { include: { category: true, subCategory: true } } }
        });
        if (!variant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        res.json({ success: true, data: variant });
    }
    catch (error) {
        console.error('Error fetching variant:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch variant' });
    }
});
exports.getVariant = getVariant;
// Create variant
const createVariant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, variantName, sku, bulkType, perBoxPiece, retailerSellingPrice, mrp, manufacturingCost, unit, photo, status = 'Active' } = req.body;
        if (!productId || !variantName || !sku || !retailerSellingPrice || !mrp || !manufacturingCost) {
            return res.status(400).json({
                success: false,
                message: 'productId, variantName, sku, retailerSellingPrice, mrp, and manufacturingCost are required'
            });
        }
        const variant = yield prismaClient_1.default.productVariant.create({
            data: {
                productId: parseInt(productId),
                variantName,
                sku,
                bulkType,
                perBoxPiece: perBoxPiece ? parseInt(perBoxPiece) : undefined,
                retailerSellingPrice: parseFloat(retailerSellingPrice),
                mrp: parseFloat(mrp),
                manufacturingCost: parseFloat(manufacturingCost),
                unit,
                photo,
                status
            },
            include: { product: { include: { category: true } } }
        });
        res.status(201).json({ success: true, data: variant, message: 'Variant created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'SKU already exists' });
        }
        console.error('Error creating variant:', error);
        res.status(500).json({ success: false, message: 'Failed to create variant' });
    }
});
exports.createVariant = createVariant;
// Update variant
const updateVariant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { variantName, sku, bulkType, perBoxPiece, retailerSellingPrice, mrp, manufacturingCost, unit, photo, status } = req.body;
        const variant = yield prismaClient_1.default.productVariant.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (variantName && { variantName })), (sku && { sku })), (bulkType && { bulkType })), (perBoxPiece && { perBoxPiece: parseInt(perBoxPiece) })), (retailerSellingPrice && { retailerSellingPrice: parseFloat(retailerSellingPrice) })), (mrp && { mrp: parseFloat(mrp) })), (manufacturingCost && { manufacturingCost: parseFloat(manufacturingCost) })), (unit && { unit })), (photo && { photo })), (status && { status })),
            include: { product: { include: { category: true } } }
        });
        res.json({ success: true, data: variant, message: 'Variant updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        console.error('Error updating variant:', error);
        res.status(500).json({ success: false, message: 'Failed to update variant' });
    }
});
exports.updateVariant = updateVariant;
// Delete variant
const deleteVariant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.productVariant.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Variant deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        console.error('Error deleting variant:', error);
        res.status(500).json({ success: false, message: 'Failed to delete variant' });
    }
});
exports.deleteVariant = deleteVariant;
// Toggle status
const toggleVariantStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const variant = yield prismaClient_1.default.productVariant.findUnique({
            where: { id: parseInt(id) }
        });
        if (!variant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        const newStatus = variant.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prismaClient_1.default.productVariant.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Variant status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling variant status:', error);
        res.status(500).json({ success: false, message: 'Failed to update variant status' });
    }
});
exports.toggleVariantStatus = toggleVariantStatus;
