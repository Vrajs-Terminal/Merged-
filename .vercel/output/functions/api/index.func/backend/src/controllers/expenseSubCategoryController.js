"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpenseSubCategory = exports.updateExpenseSubCategory = exports.createExpenseSubCategory = exports.getExpenseSubCategories = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getExpenseSubCategories = async (req, res) => {
    try {
        const items = await prismaClient_1.default.expenseSubCategory.findMany({
            include: { category: true }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch sub categories" });
    }
};
exports.getExpenseSubCategories = getExpenseSubCategories;
const createExpenseSubCategory = async (req, res) => {
    try {
        const data = req.body;
        const item = await prismaClient_1.default.expenseSubCategory.create({ data });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create sub category" });
    }
};
exports.createExpenseSubCategory = createExpenseSubCategory;
const updateExpenseSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = await prismaClient_1.default.expenseSubCategory.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update sub category" });
    }
};
exports.updateExpenseSubCategory = updateExpenseSubCategory;
const deleteExpenseSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.expenseSubCategory.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete sub category" });
    }
};
exports.deleteExpenseSubCategory = deleteExpenseSubCategory;
//# sourceMappingURL=expenseSubCategoryController.js.map