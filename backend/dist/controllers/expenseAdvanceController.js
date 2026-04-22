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
exports.adjustAdvance = exports.rejectAdvance = exports.approveAdvance = exports.createAdvance = exports.getAdvances = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getAdvances = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const advances = yield prismaClient_1.default.expenseAdvance.findMany({
            include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(advances);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.getAdvances = getAdvances;
const createAdvance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, requestedAmount, reason } = req.body;
        const advance = yield prismaClient_1.default.expenseAdvance.create({
            data: {
                employee: { connect: { id: Number(employeeId) } },
                requestedAmount: Number(requestedAmount),
                reason,
                status: 'Pending',
                remainingAmount: Number(requestedAmount)
            }
        });
        res.status(201).json(advance);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.createAdvance = createAdvance;
const approveAdvance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { approvedBy, adminRemark } = req.body;
        const adv = yield prismaClient_1.default.expenseAdvance.findUnique({ where: { id: Number(id) } });
        if (!adv)
            return res.status(404).json({ error: 'Not found' });
        const updated = yield prismaClient_1.default.expenseAdvance.update({
            where: { id: Number(id) },
            data: {
                status: 'Approved',
                approvedBy: Number(approvedBy) || 1,
                approvedAt: new Date(),
                adminRemark,
                remainingAmount: adv.requestedAmount
            }
        });
        res.json(updated);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.approveAdvance = approveAdvance;
const rejectAdvance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { adminRemark } = req.body;
        const updated = yield prismaClient_1.default.expenseAdvance.update({
            where: { id: Number(id) },
            data: { status: 'Rejected', adminRemark }
        });
        res.json(updated);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.rejectAdvance = rejectAdvance;
const adjustAdvance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { usedAmount } = req.body;
        const adv = yield prismaClient_1.default.expenseAdvance.findUnique({ where: { id: Number(id) } });
        if (!adv)
            return res.status(404).json({ error: 'Not found' });
        const newUsed = adv.usedAmount + Number(usedAmount);
        const newRemaining = Math.max(0, adv.requestedAmount - newUsed);
        const updated = yield prismaClient_1.default.expenseAdvance.update({
            where: { id: Number(id) },
            data: { usedAmount: newUsed, remainingAmount: newRemaining }
        });
        res.json(updated);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.adjustAdvance = adjustAdvance;
