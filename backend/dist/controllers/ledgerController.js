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
exports.deleteLedgerTransaction = exports.createLedgerTransaction = exports.getLedgerTransactions = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getLedgerTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId, category, startDate, endDate, search } = req.query;
        const where = {};
        if (branchId)
            where.branchId = parseInt(branchId);
        if (category && category !== "All Accounts")
            where.category = category;
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        if (search) {
            where.OR = [
                { type: { contains: search } },
                { remark: { contains: search } },
            ];
        }
        const transactions = yield prismaClient_1.default.ledgerTransaction.findMany({
            where,
            include: { branch: true },
            orderBy: { date: "desc" },
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getLedgerTransactions = getLedgerTransactions;
const createLedgerTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, type, category, branchId, amount, paymentMode, remark } = req.body;
        const transaction = yield prismaClient_1.default.ledgerTransaction.create({
            data: {
                date: date ? new Date(date) : undefined,
                type,
                category,
                branchId: branchId ? parseInt(branchId) : undefined,
                amount: parseFloat(amount),
                paymentMode,
                remark,
            },
        });
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.createLedgerTransaction = createLedgerTransaction;
const deleteLedgerTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.ledgerTransaction.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: "Transaction deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.deleteLedgerTransaction = deleteLedgerTransaction;
