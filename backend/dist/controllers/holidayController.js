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
exports.updateExchangeStatus = exports.getExchangeRequests = exports.createExchangeRequest = exports.assignHoliday = exports.deleteHoliday = exports.getHolidays = exports.createHoliday = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// Helper for numeric conversion
const toInt = (val) => (val ? parseInt(String(val)) : undefined);
// ─── HOLIDAYS ────────────────────────────────────────────────────────────────
const createHoliday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, date, type, description } = req.body;
        const holiday = yield prisma_1.default.holiday.create({
            data: {
                name,
                date: new Date(date),
                type: type || "Public",
                description
            }
        });
        res.status(201).json({ message: "Holiday created successfully.", holiday });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to create holiday." });
    }
});
exports.createHoliday = createHoliday;
const getHolidays = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const holidays = yield prisma_1.default.holiday.findMany({
            orderBy: { date: "asc" },
            include: { HolidayAssignment: true }
        });
        res.json({ holidays });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch holidays." });
    }
});
exports.getHolidays = getHolidays;
const deleteHoliday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = toInt(req.params["id"]);
        yield prisma_1.default.holiday.delete({ where: { id } });
        res.json({ message: "Holiday deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete holiday." });
    }
});
exports.deleteHoliday = deleteHoliday;
// ─── HOLIDAY ASSIGNMENTS ─────────────────────────────────────────────────────
const assignHoliday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { holidayId, targetType, targetIds } = req.body; // targetType: Company, Branch, Department, Employee
        if (!Array.isArray(targetIds) || targetIds.length === 0) {
            // Single assignment if targetId is provided instead of array
            if (req.body.targetId) {
                const assignment = yield prisma_1.default.holidayAssignment.create({
                    data: {
                        holidayId: toInt(holidayId),
                        targetType,
                        targetId: toInt(req.body.targetId)
                    }
                });
                res.status(201).json({ message: "Holiday assigned.", assignment });
                return;
            }
            res.status(400).json({ error: "targetIds array or targetId is required." });
            return;
        }
        const assignments = yield Promise.all(targetIds.map((tid) => prisma_1.default.holidayAssignment.create({
            data: {
                holidayId: toInt(holidayId),
                targetType,
                targetId: toInt(tid)
            }
        })));
        res.status(201).json({ message: `${assignments.length} assignment(s) created.`, assignments });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to assign holiday." });
    }
});
exports.assignHoliday = assignHoliday;
// ─── HOLIDAY EXCHANGE REQUESTS ────────────────────────────────────────────────
const createExchangeRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, originalHolidayId, exchangeDate, reason } = req.body;
        const request = yield prisma_1.default.holidayExchangeRequest.create({
            data: {
                employeeId: toInt(employeeId),
                originalHolidayId: toInt(originalHolidayId),
                exchangeDate: new Date(exchangeDate),
                reason,
                status: "Pending"
            }
        });
        res.status(201).json({ message: "Exchange request submitted.", request });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to submit request." });
    }
});
exports.createExchangeRequest = createExchangeRequest;
const getExchangeRequests = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield prisma_1.default.holidayExchangeRequest.findMany({
            include: {
                employee: { select: { firstName: true, lastName: true, employeeId: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ requests });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch requests." });
    }
});
exports.getExchangeRequests = getExchangeRequests;
const updateExchangeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = toInt(req.params["id"]);
        const { status } = req.body; // Approved / Rejected
        const request = yield prisma_1.default.holidayExchangeRequest.update({
            where: { id },
            data: { status }
        });
        res.json({ message: `Request ${status.toLowerCase()}.`, request });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update request status." });
    }
});
exports.updateExchangeStatus = updateExchangeStatus;
