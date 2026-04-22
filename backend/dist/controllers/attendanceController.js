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
exports.getMonthlyAttendance = exports.getTodayStatus = exports.clockOut = exports.clockIn = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// ─── HELPERS ─────────────────────────────────────────────────────────────────
const toInt = (val) => (val ? parseInt(String(val)) : undefined);
// Helper to find the active shift for an employee on a given date
function getActiveShift(employeeId, date) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Check for approved Shift Change Requests
        const changeRequest = yield prismaClient_1.default.shiftChangeRequest.findFirst({
            where: {
                employeeId,
                date,
                status: "Approved"
            },
            include: { requestedShift: true }
        });
        if (changeRequest)
            return changeRequest.requestedShift;
        // 2. Check for Shift Assignments
        const assignment = yield prismaClient_1.default.shiftAssignment.findFirst({
            where: {
                employeeId,
                isActive: true,
                startDate: { lte: date },
                OR: [
                    { endDate: null },
                    { endDate: { gte: date } }
                ]
            },
            include: { shift: true }
        });
        if (assignment)
            return assignment.shift;
        return null;
    });
}
// Helper to check if a date is a holiday for an employee
function checkHoliday(employeeId, date) {
    return __awaiter(this, void 0, void 0, function* () {
        const holiday = yield prismaClient_1.default.holiday.findFirst({
            where: {
                date,
                HolidayAssignment: {
                    some: {
                        OR: [
                            { targetType: "Employee", targetId: employeeId },
                            // In a real system, we'd also check Company/Branch/Dept IDs here
                            // For simplicity, we assume targetId matches based on targetType
                        ]
                    }
                }
            }
        });
        return holiday;
    });
}
// ─── ATTENDANCE API ──────────────────────────────────────────────────────────
const clockIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeId = req.user.id;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0] || "";
        const todayDate = new Date(todayStr);
        // Check if already clocked in
        const existingLog = yield prismaClient_1.default.attendanceLog.findUnique({
            where: { employeeId_date: { employeeId, date: todayDate } }
        });
        if (existingLog) {
            res.status(400).json({ error: "Already clocked in today." });
            return;
        }
        const log = yield prismaClient_1.default.attendanceLog.create({
            data: {
                employeeId,
                date: todayDate,
                clockIn: now,
                ipAddress: req.ip || req.connection.remoteAddress,
                status: "Present"
            }
        });
        res.status(201).json({ message: "Successfully clocked in.", log });
    }
    catch (error) {
        console.error("Clock In Error:", error);
        res.status(500).json({ error: "Failed to clock in." });
    }
});
exports.clockIn = clockIn;
const clockOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeId = req.user.id;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0] || "";
        const todayDate = new Date(todayStr);
        // Midnight Shift Handling: Look for yesterday's log if today's is missing
        let targetLog = yield prismaClient_1.default.attendanceLog.findUnique({
            where: { employeeId_date: { employeeId, date: todayDate } }
        });
        if (!targetLog || targetLog.clockOut) {
            const yesterdayDate = new Date(todayDate);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayLog = yield prismaClient_1.default.attendanceLog.findUnique({
                where: { employeeId_date: { employeeId, date: yesterdayDate } }
            });
            if (yesterdayLog && !yesterdayLog.clockOut) {
                targetLog = yesterdayLog;
            }
        }
        if (!targetLog) {
            res.status(400).json({ error: "No active clock-in record found." });
            return;
        }
        if (targetLog.clockOut) {
            res.status(400).json({ error: "Already clocked out today." });
            return;
        }
        if (!targetLog.clockIn) {
            res.status(400).json({ error: "Invalid clock-in data." });
            return;
        }
        const clockInTime = new Date(targetLog.clockIn);
        const diffMs = now.getTime() - clockInTime.getTime();
        const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        // Basic Penalty/Status Calculation (can be expanded with Shift rules)
        let status = totalHours < 4 ? "Half Day" : "Present";
        // Integration with Holidays
        const isHoliday = yield checkHoliday(employeeId, targetLog.date);
        if (isHoliday)
            status = "Holiday Working";
        const updatedLog = yield prismaClient_1.default.attendanceLog.update({
            where: { id: targetLog.id },
            data: {
                clockOut: now,
                totalHours,
                status
            }
        });
        res.json({ message: "Successfully clocked out.", log: updatedLog });
    }
    catch (error) {
        console.error("Clock Out Error:", error);
        res.status(500).json({ error: "Failed to clock out." });
    }
});
exports.clockOut = clockOut;
const getTodayStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeId = req.user.id;
        const todayStr = new Date().toISOString().split('T')[0] || "";
        const todayDate = new Date(todayStr);
        const log = yield prismaClient_1.default.attendanceLog.findUnique({
            where: { employeeId_date: { employeeId, date: todayDate } }
        });
        res.json({ log });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch today's status." });
    }
});
exports.getTodayStatus = getTodayStatus;
const getMonthlyAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const month = req.query.month; // YYYY-MM
        if (!month) {
            res.status(400).json({ error: "Month parameter (YYYY-MM) is required." });
            return;
        }
        const startDate = new Date(`${month}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        const logs = yield prismaClient_1.default.attendanceLog.findMany({
            where: {
                date: { gte: startDate, lt: endDate }
            },
            include: {
                employee: { select: { firstName: true, lastName: true, employeeId: true, department: true } }
            },
            orderBy: [{ employeeId: 'asc' }, { date: 'asc' }]
        });
        res.json({ logs });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch monthly report." });
    }
});
exports.getMonthlyAttendance = getMonthlyAttendance;
