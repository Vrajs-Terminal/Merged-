"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExchangeStatus = exports.getExchangeRequests = exports.createExchangeRequest = exports.assignHoliday = exports.deleteHoliday = exports.getHolidays = exports.createHoliday = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// Helper for numeric conversion
const toInt = (val) => (val ? parseInt(String(val)) : undefined);
// ─── HOLIDAYS ────────────────────────────────────────────────────────────────
const createHoliday = async (req, res) => {
    try {
        const { name, date, type, description } = req.body;
        const holiday = await prisma_1.default.holiday.create({
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
};
exports.createHoliday = createHoliday;
const getHolidays = async (req, res) => {
    try {
        const holidays = await prisma_1.default.holiday.findMany({
            orderBy: { date: "asc" },
            include: { HolidayAssignment: true }
        });
        res.json({ holidays });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch holidays." });
    }
};
exports.getHolidays = getHolidays;
const deleteHoliday = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        await prisma_1.default.holiday.delete({ where: { id } });
        res.json({ message: "Holiday deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete holiday." });
    }
};
exports.deleteHoliday = deleteHoliday;
// ─── HOLIDAY ASSIGNMENTS ─────────────────────────────────────────────────────
const assignHoliday = async (req, res) => {
    try {
        const { holidayId, targetType, targetIds } = req.body; // targetType: Company, Branch, Department, Employee
        if (!Array.isArray(targetIds) || targetIds.length === 0) {
            // Single assignment if targetId is provided instead of array
            if (req.body.targetId) {
                const assignment = await prisma_1.default.holidayAssignment.create({
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
        const assignments = await Promise.all(targetIds.map((tid) => prisma_1.default.holidayAssignment.create({
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
};
exports.assignHoliday = assignHoliday;
// ─── HOLIDAY EXCHANGE REQUESTS ────────────────────────────────────────────────
const createExchangeRequest = async (req, res) => {
    try {
        const { employeeId, originalHolidayId, exchangeDate, reason } = req.body;
        const request = await prisma_1.default.holidayExchangeRequest.create({
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
};
exports.createExchangeRequest = createExchangeRequest;
const getExchangeRequests = async (_req, res) => {
    try {
        const requests = await prisma_1.default.holidayExchangeRequest.findMany({
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
};
exports.getExchangeRequests = getExchangeRequests;
const updateExchangeStatus = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        const { status } = req.body; // Approved / Rejected
        const request = await prisma_1.default.holidayExchangeRequest.update({
            where: { id },
            data: { status }
        });
        res.json({ message: `Request ${status.toLowerCase()}.`, request });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update request status." });
    }
};
exports.updateExchangeStatus = updateExchangeStatus;
//# sourceMappingURL=holidayController.js.map