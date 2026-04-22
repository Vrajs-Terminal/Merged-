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
exports.deleteDistributorAssignmentsByEmployee = exports.deleteDistributorAssignment = exports.createDistributorAssignments = exports.getDistributorAssignments = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getDistributorAssignments = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield prismaClient_1.default.distributorAssignment.findMany({
            include: {
                employee: true,
                distributor: true,
            },
            orderBy: { createdAt: "desc" },
        });
        const grouped = rows.reduce((acc, row) => {
            const existing = acc.find(item => { var _a; return ((_a = item.employee) === null || _a === void 0 ? void 0 : _a.id) === row.employeeId; });
            if (existing) {
                existing.distributors.push(row.distributor);
                return acc;
            }
            acc.push({
                id: row.employeeId,
                employee: row.employee,
                distributors: [row.distributor],
                createdAt: row.createdAt,
            });
            return acc;
        }, []);
        res.status(200).json(grouped);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getDistributorAssignments = getDistributorAssignments;
const createDistributorAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, distributorIds } = req.body;
        const employee = yield prismaClient_1.default.employee.findUnique({ where: { id: Number(employeeId) } });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        const ids = Array.isArray(distributorIds) ? distributorIds.map((id) => Number(id)).filter(Boolean) : [];
        if (ids.length === 0) {
            return res.status(400).json({ message: "At least one distributor is required" });
        }
        yield prismaClient_1.default.distributorAssignment.deleteMany({
            where: { employeeId: Number(employeeId) },
        });
        yield prismaClient_1.default.distributorAssignment.createMany({
            data: ids.map((distributorId) => ({
                employeeId: Number(employeeId),
                distributorId,
            })),
            skipDuplicates: true,
        });
        const rows = yield prismaClient_1.default.distributorAssignment.findMany({
            where: { employeeId: Number(employeeId) },
            include: { employee: true, distributor: true },
        });
        res.status(201).json({
            message: "Distributor assignments saved successfully",
            assignments: rows,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.createDistributorAssignments = createDistributorAssignments;
const deleteDistributorAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.distributorAssignment.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Assignment deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.deleteDistributorAssignment = deleteDistributorAssignment;
const deleteDistributorAssignmentsByEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.params;
        yield prismaClient_1.default.distributorAssignment.deleteMany({
            where: { employeeId: Number(employeeId) },
        });
        res.status(200).json({ message: "Employee assignments deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.deleteDistributorAssignmentsByEmployee = deleteDistributorAssignmentsByEmployee;
