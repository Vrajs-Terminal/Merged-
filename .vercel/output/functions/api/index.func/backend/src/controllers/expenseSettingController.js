"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpenseSetting = exports.updateExpenseSetting = exports.createExpenseSetting = exports.getExpenseSettings = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getExpenseSettings = async (req, res) => {
    try {
        const items = await prismaClient_1.default.expenseSetting.findMany({
            include: {
                branch: true,
                department: true
            }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch expense settings" });
    }
};
exports.getExpenseSettings = getExpenseSettings;
const createExpenseSetting = async (req, res) => {
    try {
        const { branchId, departmentId, subDepartmentId, ...rest } = req.body;
        const data = {
            ...rest,
            branchId: branchId ? Number(branchId) : null,
            departmentId: departmentId ? Number(departmentId) : null,
            subDepartment: subDepartmentId ? String(subDepartmentId) : null,
        };
        const item = await prismaClient_1.default.expenseSetting.create({ data });
        res.status(201).json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create expense setting" });
    }
};
exports.createExpenseSetting = createExpenseSetting;
const updateExpenseSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId, departmentId, subDepartmentId, ...rest } = req.body;
        const data = {
            ...rest,
            branchId: branchId ? Number(branchId) : null,
            departmentId: departmentId ? Number(departmentId) : null,
            subDepartment: subDepartmentId ? String(subDepartmentId) : null,
        };
        const item = await prismaClient_1.default.expenseSetting.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update expense setting" });
    }
};
exports.updateExpenseSetting = updateExpenseSetting;
const deleteExpenseSetting = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.expenseSetting.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete expense setting" });
    }
};
exports.deleteExpenseSetting = deleteExpenseSetting;
//# sourceMappingURL=expenseSettingController.js.map