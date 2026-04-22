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
// Fetch active categories for dropdown
router.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prismaClient_1.default.taxBenefitCategory.findMany({
            where: { status: 'Active' },
            select: { id: true, category_name: true, section_code: true, max_limit: true, applicable_regime: true }
        });
        res.json(categories);
    }
    catch (error) {
        console.error("Error fetching categories for dropdown:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}));
// GET / - Fetch all sub categories
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { sub_category_name: { contains: search } },
                { code: { contains: search } },
                { category: { category_name: { contains: search } } }
            ];
        }
        const subCategories = yield prismaClient_1.default.taxBenefitSubCategory.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subCategories);
    }
    catch (error) {
        console.error("Error fetching sub categories:", error);
        res.status(500).json({ error: "Failed to fetch sub categories" });
    }
}));
// POST / - Create a new sub category
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id, sub_category_name, code, max_limit, proof_required, declaration_type, applicable_regime, description, status } = req.body;
        // Validation for uniqueness
        const existing = yield prismaClient_1.default.taxBenefitSubCategory.findUnique({
            where: { code }
        });
        if (existing) {
            return res.status(400).json({ error: "A sub-category with this Code already exists" });
        }
        // Limit Validation against parent
        const parentCategory = yield prismaClient_1.default.taxBenefitCategory.findUnique({ where: { id: parseInt(category_id) } });
        if (!parentCategory) {
            return res.status(404).json({ error: "Parent category not found" });
        }
        const parsedLimit = parseFloat(max_limit) || 0;
        if (parsedLimit > parentCategory.max_limit) {
            return res.status(400).json({
                error: `Sub-category limit (₹${parsedLimit}) cannot exceed parent section ${parentCategory.section_code} limit (₹${parentCategory.max_limit})`
            });
        }
        const subCat = yield prismaClient_1.default.taxBenefitSubCategory.create({
            data: {
                category_id: parseInt(category_id),
                sub_category_name,
                code,
                max_limit: parsedLimit,
                proof_required: proof_required !== null && proof_required !== void 0 ? proof_required : false,
                declaration_type: declaration_type || 'Yearly',
                applicable_regime,
                description,
                status: status || 'Active'
            }
        });
        res.status(201).json({ message: "Sub Category created successfully", data: subCat });
    }
    catch (error) {
        console.error("Error creating tax benefit sub category:", error);
        res.status(500).json({ error: "Failed to create sub category" });
    }
}));
// PUT /:id - Edit sub category
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { category_id, sub_category_name, code, max_limit, proof_required, declaration_type, applicable_regime, description, status } = req.body;
        // Code conflict check
        if (code) {
            const existing = yield prismaClient_1.default.taxBenefitSubCategory.findUnique({ where: { code } });
            if (existing && existing.id !== id) {
                return res.status(400).json({ error: "Another sub-category is using this Code" });
            }
        }
        // Limit Validation against parent
        if (category_id !== undefined && max_limit !== undefined) {
            const parentCategory = yield prismaClient_1.default.taxBenefitCategory.findUnique({ where: { id: parseInt(category_id) } });
            if (!parentCategory) {
                return res.status(404).json({ error: "Parent category not found" });
            }
            const parsedLimit = parseFloat(max_limit) || 0;
            if (parsedLimit > parentCategory.max_limit) {
                return res.status(400).json({
                    error: `Sub-category limit (₹${parsedLimit}) cannot exceed parent section ${parentCategory.section_code} limit (₹${parentCategory.max_limit})`
                });
            }
        }
        const updated = yield prismaClient_1.default.taxBenefitSubCategory.update({
            where: { id },
            data: Object.assign(Object.assign({}, (category_id !== undefined && { category_id: parseInt(category_id) })), { sub_category_name,
                code, max_limit: max_limit !== undefined ? parseFloat(max_limit) : undefined, proof_required,
                declaration_type,
                applicable_regime,
                description,
                status })
        });
        res.json({ message: "Sub Category updated successfully", data: updated });
    }
    catch (error) {
        console.error("Error updating tax benefit sub category:", error);
        res.status(500).json({ error: "Failed to update sub category" });
    }
}));
// DELETE /:id - Delete sub category
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield prismaClient_1.default.taxBenefitSubCategory.delete({ where: { id } });
        res.json({ message: "Sub Category deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting tax benefit sub category:", error);
        res.status(500).json({ error: "Failed to delete sub category" });
    }
}));
exports.default = router;
