"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpenseCategory = exports.updateExpenseCategory = exports.createExpenseCategory = exports.getExpenseCategories = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getExpenseCategories = async (req, res) => {
    try {
        const items = await prismaClient_1.default.expenseCategory.findMany({});
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch expense categories" });
    }
};
exports.getExpenseCategories = getExpenseCategories;
const createExpenseCategory = async (req, res) => {
    try {
        const data = req.body;
        const item = await prismaClient_1.default.expenseCategory.create({ data });
        res.status(201).json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create expense category" });
    }
};
exports.createExpenseCategory = createExpenseCategory;
const updateExpenseCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = await prismaClient_1.default.expenseCategory.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update expense category" });
    }
};
exports.updateExpenseCategory = updateExpenseCategory;
const deleteExpenseCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.expenseCategory.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete expense category" });
    }
};
exports.deleteExpenseCategory = deleteExpenseCategory;
//# sourceMappingURL=expenseCategoryController.js.map