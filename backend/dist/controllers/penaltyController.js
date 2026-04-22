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
exports.PenaltyController = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
exports.PenaltyController = {
    // Penalty Rules
    createRule: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rule = yield prismaClient_1.default.penaltyRule.create({
                data: req.body
            });
            res.json(rule);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getRules: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rules = yield prismaClient_1.default.penaltyRule.findMany({
                include: { shift: true }
            });
            res.json(rules);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    updateRule: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const rule = yield prismaClient_1.default.penaltyRule.update({
                where: { id: Number(id) },
                data: req.body
            });
            res.json(rule);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteRule: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield prismaClient_1.default.penaltyRule.delete({
                where: { id: Number(id) }
            });
            res.json({ message: "Rule deleted" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Penalty Conversions
    createConversion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const conversion = yield prismaClient_1.default.penaltyConversion.create({
                data: req.body
            });
            res.json(conversion);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getConversions: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const conversions = yield prismaClient_1.default.penaltyConversion.findMany({
                include: { leaveType: true }
            });
            res.json(conversions);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Penalty Records (Manage / Pending)
    getRecords: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { status, employeeId, startDate, endDate, penaltyType } = req.query;
            const filters = {};
            if (status)
                filters.status = status;
            if (employeeId)
                filters.employeeId = Number(employeeId);
            if (startDate && endDate) {
                filters.date = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }
            if (penaltyType && penaltyType !== "All")
                filters.penaltyType = penaltyType;
            const records = yield prismaClient_1.default.penaltyRecord.findMany({
                where: filters,
                include: {
                    employee: {
                        select: { firstName: true, lastName: true, employeeId: true, department: true }
                    },
                    shift: true,
                    rule: true
                },
                orderBy: { date: "desc" }
            });
            res.json(records);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    approvePenalty: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { approvedBy } = req.body;
            const record = yield prismaClient_1.default.penaltyRecord.update({
                where: { id: Number(id) },
                data: {
                    status: "Approved",
                    approvedBy: Number(approvedBy),
                    approvedAt: new Date()
                }
            });
            res.json(record);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    rejectPenalty: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { rejectionReason } = req.body;
            const record = yield prismaClient_1.default.penaltyRecord.update({
                where: { id: Number(id) },
                data: {
                    status: "Rejected",
                    rejectionReason
                }
            });
            res.json(record);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteRecord: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield prismaClient_1.default.penaltyRecord.delete({
                where: { id: Number(id) }
            });
            res.json({ message: "Record deleted" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getReport: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { employeeId, departmentId, startDate, endDate, penaltyType } = req.query;
            const filters = { status: "Approved" };
            if (employeeId)
                filters.employeeId = Number(employeeId);
            if (startDate && endDate) {
                filters.date = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }
            if (penaltyType && penaltyType !== "All")
                filters.penaltyType = penaltyType;
            // If department filter is needed, it would be complex with prisma as it's several levels deep, 
            // but usually employee already has department string.
            const records = yield prismaClient_1.default.penaltyRecord.findMany({
                where: filters,
                include: {
                    employee: true
                }
            });
            // Aggregate by employee
            const reportMap = {};
            records.forEach((r) => {
                const empId = r.employeeId;
                if (!reportMap[empId]) {
                    reportMap[empId] = {
                        employee: `${r.employee.firstName} ${r.employee.lastName}`,
                        department: r.employee.department,
                        totalPenalties: 0,
                        totalAmountDeducted: 0,
                        leaveDeducted: 0
                    };
                }
                reportMap[empId].totalPenalties += 1;
                reportMap[empId].totalAmountDeducted += r.amountDeducted || 0;
                reportMap[empId].leaveDeducted += r.leaveDeducted || 0;
            });
            res.json(Object.values(reportMap));
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
