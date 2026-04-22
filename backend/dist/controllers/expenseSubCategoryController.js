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
exports.deleteExpenseSubCategory = exports.updateExpenseSubCategory = exports.createExpenseSubCategory = exports.getExpenseSubCategories = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getExpenseSubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prismaClient_1.default.expenseSubCategory.findMany({
            include: { category: true }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch sub categories" });
    }
});
exports.getExpenseSubCategories = getExpenseSubCategories;
const createExpenseSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const item = yield prismaClient_1.default.expenseSubCategory.create({ data });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create sub category" });
    }
});
exports.createExpenseSubCategory = createExpenseSubCategory;
const updateExpenseSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = yield prismaClient_1.default.expenseSubCategory.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update sub category" });
    }
});
exports.updateExpenseSubCategory = updateExpenseSubCategory;
const deleteExpenseSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.expenseSubCategory.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete sub category" });
    }
});
exports.deleteExpenseSubCategory = deleteExpenseSubCategory;
