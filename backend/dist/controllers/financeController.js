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
exports.getFinanceById = exports.createFinance = exports.getFinances = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getFinances = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const finances = yield prismaClient_1.default.finance.findMany();
        res.status(200).json(finances);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getFinances = getFinances;
const createFinance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const finance = yield prismaClient_1.default.finance.create({
            data,
        });
        res.status(201).json(finance);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createFinance = createFinance;
const getFinanceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const finance = yield prismaClient_1.default.finance.findFirst({
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
});
exports.getFinanceById = getFinanceById;
