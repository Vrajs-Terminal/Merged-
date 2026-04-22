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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpenseSetting = exports.updateExpenseSetting = exports.createExpenseSetting = exports.getExpenseSettings = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getExpenseSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prismaClient_1.default.expenseSetting.findMany({
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
});
exports.getExpenseSettings = getExpenseSettings;
const createExpenseSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { branchId, departmentId, subDepartmentId } = _a, rest = __rest(_a, ["branchId", "departmentId", "subDepartmentId"]);
        const data = Object.assign(Object.assign({}, rest), { branchId: branchId ? Number(branchId) : null, departmentId: departmentId ? Number(departmentId) : null, subDepartment: subDepartmentId ? String(subDepartmentId) : null });
        const item = yield prismaClient_1.default.expenseSetting.create({ data });
        res.status(201).json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create expense setting" });
    }
});
exports.createExpenseSetting = createExpenseSetting;
const updateExpenseSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const _a = req.body, { branchId, departmentId, subDepartmentId } = _a, rest = __rest(_a, ["branchId", "departmentId", "subDepartmentId"]);
        const data = Object.assign(Object.assign({}, rest), { branchId: branchId ? Number(branchId) : null, departmentId: departmentId ? Number(departmentId) : null, subDepartment: subDepartmentId ? String(subDepartmentId) : null });
        const item = yield prismaClient_1.default.expenseSetting.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update expense setting" });
    }
});
exports.updateExpenseSetting = updateExpenseSetting;
const deleteExpenseSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.expenseSetting.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete expense setting" });
    }
});
exports.deleteExpenseSetting = deleteExpenseSetting;
