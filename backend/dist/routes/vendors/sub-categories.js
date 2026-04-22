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
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// GET all sub-categories
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.query;
        const where = {};
        if (categoryId)
            where.categoryId = Number(categoryId);
        const subCategories = yield prismaClient_1.default.vendorSubCategory.findMany({
            where,
            include: {
                category: { select: { name: true } },
                _count: { select: { vendors: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(subCategories);
    }
    catch (error) {
        console.error("Error fetching vendor sub-categories:", error);
        res.status(500).json({ error: "Failed to fetch sub-categories" });
    }
}));
// POST create sub-category
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status, categoryId } = req.body;
        const subCategory = yield prismaClient_1.default.vendorSubCategory.create({
            data: { name, description, status, categoryId: Number(categoryId) }
        });
        res.status(201).json(subCategory);
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ error: "Sub-category already exists in this category" });
        res.status(500).json({ error: "Failed to create sub-category" });
    }
}));
// PUT update sub-category
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status, categoryId } = req.body;
        const subCategory = yield prismaClient_1.default.vendorSubCategory.update({
            where: { id: Number(req.params.id) },
            data: { name, description, status, categoryId: Number(categoryId) }
        });
        res.json(subCategory);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update sub-category" });
    }
}));
// DELETE sub-category
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prismaClient_1.default.vendorSubCategory.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: "Sub-category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete sub-category" });
    }
}));
exports.default = router;
