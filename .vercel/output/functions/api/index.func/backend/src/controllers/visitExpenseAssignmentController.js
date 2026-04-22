"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVisitExpenseAssignment = exports.updateVisitExpenseAssignment = exports.createVisitExpenseAssignment = exports.getVisitExpenseAssignments = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getVisitExpenseAssignments = async (req, res) => {
    try {
        const items = await prismaClient_1.default.visitExpenseAssignment.findMany({
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
};
exports.getVisitExpenseAssignments = getVisitExpenseAssignments;
const createVisitExpenseAssignment = async (req, res) => {
    try {
        const data = req.body;
        const item = await prismaClient_1.default.visitExpenseAssignment.create({ data });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create assignment" });
    }
};
exports.createVisitExpenseAssignment = createVisitExpenseAssignment;
const updateVisitExpenseAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = await prismaClient_1.default.visitExpenseAssignment.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update assignment" });
    }
};
exports.updateVisitExpenseAssignment = updateVisitExpenseAssignment;
const deleteVisitExpenseAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.visitExpenseAssignment.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete assignment" });
    }
};
exports.deleteVisitExpenseAssignment = deleteVisitExpenseAssignment;
//# sourceMappingURL=visitExpenseAssignmentController.js.map