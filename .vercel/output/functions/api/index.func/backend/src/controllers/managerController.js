"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignEmployees = exports.deleteManager = exports.updateManager = exports.createManager = exports.getManagers = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getManagers = async (req, res) => {
    try {
        const managers = await prismaClient_1.default.manager.findMany({
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
};
exports.getManagers = getManagers;
const createManager = async (req, res) => {
    try {
        const data = req.body;
        const manager = await prismaClient_1.default.manager.create({
            data,
        });
        res.status(201).json(manager);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.createManager = createManager;
const updateManager = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedManager = await prismaClient_1.default.manager.update({
            where: { id: parseInt(id) },
            data
        });
        res.status(200).json(updatedManager);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.updateManager = updateManager;
const deleteManager = async (req, res) => {
    try {
        const { id } = req.params;
        const manager = await prismaClient_1.default.manager.findUnique({
            where: { id: parseInt(id) },
            include: { _count: { select: { employees: true } } }
        });
        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }
        if (manager._count.employees > 0) {
            return res.status(400).json({ message: "Cannot delete manager with active assigned employees. Please reassign them first." });
        }
        await prismaClient_1.default.manager.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ message: "Manager deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.deleteManager = deleteManager;
const assignEmployees = async (req, res) => {
    try {
        // expect an array of employee id integers
        const { managerId, employeeIds, effectiveFrom, remarks } = req.body;
        if (!managerId || !employeeIds || !Array.isArray(employeeIds)) {
            return res.status(400).json({ message: "Invalid request format" });
        }
        // Update all chosen employees to point to this manager
        const updateResult = await prismaClient_1.default.employee.updateMany({
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
};
exports.assignEmployees = assignEmployees;
//# sourceMappingURL=managerController.js.map