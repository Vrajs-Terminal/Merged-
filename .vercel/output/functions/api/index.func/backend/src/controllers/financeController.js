"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinanceById = exports.createFinance = exports.getFinances = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getFinances = async (req, res) => {
    try {
        const finances = await prismaClient_1.default.finance.findMany();
        res.status(200).json(finances);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getFinances = getFinances;
const createFinance = async (req, res) => {
    try {
        const data = req.body;
        const finance = await prismaClient_1.default.finance.create({
            data,
        });
        res.status(201).json(finance);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.createFinance = createFinance;
const getFinanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const finance = await prismaClient_1.default.finance.findFirst({
            where: { employeeId: id },
        });
        if (!finance) {
            res.status(404).json({ message: "Finance record not found" });
            return;
        }
        res.status(200).json(finance);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getFinanceById = getFinanceById;
//# sourceMappingURL=financeController.js.map