"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExEmployeeById = exports.createExEmployee = exports.getExEmployees = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getExEmployees = async (req, res) => {
    try {
        const exEmployees = await prismaClient_1.default.exEmployee.findMany();
        res.status(200).json(exEmployees);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getExEmployees = getExEmployees;
const createExEmployee = async (req, res) => {
    try {
        const data = req.body;
        // ensure date parses correctly if provided as string
        if (data.exitDate)
            data.exitDate = new Date(data.exitDate);
        const exEmployee = await prismaClient_1.default.exEmployee.create({
            data,
        });
        res.status(201).json(exEmployee);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.createExEmployee = createExEmployee;
const getExEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const exEmployee = await prismaClient_1.default.exEmployee.findFirst({
            where: { employeeId: id },
        });
        if (!exEmployee) {
            res.status(404).json({ message: "ExEmployee not found" });
            return;
        }
        res.status(200).json(exEmployee);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getExEmployeeById = getExEmployeeById;
//# sourceMappingURL=exEmployeeController.js.map