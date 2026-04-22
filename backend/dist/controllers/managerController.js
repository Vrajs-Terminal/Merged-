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
exports.assignEmployees = exports.deleteManager = exports.updateManager = exports.createManager = exports.getManagers = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getManagers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const managers = yield prismaClient_1.default.manager.findMany({
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        });
        res.status(200).json(managers);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getManagers = getManagers;
const createManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const manager = yield prismaClient_1.default.manager.create({
            data,
        });
        res.status(201).json(manager);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createManager = createManager;
const updateManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedManager = yield prismaClient_1.default.manager.update({
            where: { id: parseInt(id) },
            data
        });
        res.status(200).json(updatedManager);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateManager = updateManager;
const deleteManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const manager = yield prismaClient_1.default.manager.findUnique({
            where: { id: parseInt(id) },
            include: { _count: { select: { employees: true } } }
        });
        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }
        if (manager._count.employees > 0) {
            return res.status(400).json({ message: "Cannot delete manager with active assigned employees. Please reassign them first." });
        }
        yield prismaClient_1.default.manager.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ message: "Manager deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.deleteManager = deleteManager;
const assignEmployees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // expect an array of employee id integers
        const { managerId, employeeIds, effectiveFrom, remarks } = req.body;
        if (!managerId || !employeeIds || !Array.isArray(employeeIds)) {
            return res.status(400).json({ message: "Invalid request format" });
        }
        // Update all chosen employees to point to this manager
        const updateResult = yield prismaClient_1.default.employee.updateMany({
            where: {
                id: { in: employeeIds }
            },
            data: {
                managerId: parseInt(managerId),
                managerEffectiveDate: effectiveFrom ? new Date(effectiveFrom) : null,
                managerRemarks: remarks || null
            }
        });
        res.status(200).json({ message: `Successfully assigned ${updateResult.count} employees to manager.`, count: updateResult.count });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.assignEmployees = assignEmployees;
