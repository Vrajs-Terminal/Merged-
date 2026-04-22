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
// GET all categories
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prismaClient_1.default.vendorCategory.findMany({
            include: {
                _count: {
                    select: { vendors: true, subCategories: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        console.error("Error fetching vendor categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}));
// GET single category
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield prismaClient_1.default.vendorCategory.findUnique({
            where: { id: Number(req.params.id) },
            include: { subCategories: true }
        });
        if (!category)
            return res.status(404).json({ error: "Category not found" });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch category" });
    }
}));
// POST create category
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status } = req.body;
        const category = yield prismaClient_1.default.vendorCategory.create({
            data: { name, description, status }
        });
        res.status(201).json(category);
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ error: "Category name already exists" });
        res.status(500).json({ error: "Failed to create category" });
    }
}));
// PUT update category
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status } = req.body;
        const category = yield prismaClient_1.default.vendorCategory.update({
            where: { id: Number(req.params.id) },
            data: { name, description, status }
        });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update category" });
    }
}));
// DELETE category
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prismaClient_1.default.vendorCategory.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
    }
}));
exports.default = router;
