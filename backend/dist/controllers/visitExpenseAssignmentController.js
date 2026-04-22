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
exports.deleteVisitExpenseAssignment = exports.updateVisitExpenseAssignment = exports.createVisitExpenseAssignment = exports.getVisitExpenseAssignments = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getVisitExpenseAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prismaClient_1.default.visitExpenseAssignment.findMany({
            include: {
                employee: true,
                category: true,
                subCategory: true
            }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});
exports.getVisitExpenseAssignments = getVisitExpenseAssignments;
const createVisitExpenseAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const item = yield prismaClient_1.default.visitExpenseAssignment.create({ data });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create assignment" });
    }
});
exports.createVisitExpenseAssignment = createVisitExpenseAssignment;
const updateVisitExpenseAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = yield prismaClient_1.default.visitExpenseAssignment.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update assignment" });
    }
});
exports.updateVisitExpenseAssignment = updateVisitExpenseAssignment;
const deleteVisitExpenseAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.visitExpenseAssignment.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete assignment" });
    }
});
exports.deleteVisitExpenseAssignment = deleteVisitExpenseAssignment;
