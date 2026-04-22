import type { Response } from "express";
import prisma from '../lib/prismaClient';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const toInt = (val: any) => (val ? parseInt(String(val)) : undefined);

// Helper to find the active shift for an employee on a given date
async function getActiveShift(employeeId: number, date: Date) {
    // 1. Check for approved Shift Change Requests
    const changeRequest = await prisma.shiftChangeRequest.findFirst({
        where: {
            employeeId,
            date,
            status: "Approved"
        },
        include: { requestedShift: true }
    });
    if (changeRequest) return changeRequest.requestedShift;

    // 2. Check for Shift Assignments
    const assignment = await prisma.shiftAssignment.findFirst({
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
    if (assignment) return assignment.shift;

    return null;
}

// Helper to check if a date is a holiday for an employee
async function checkHoliday(employeeId: number, date: Date) {
    const holiday = await prisma.holiday.findFirst({
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
}

// ─── ATTENDANCE API ──────────────────────────────────────────────────────────

export const clockIn = async (req: any, res: Response): Promise<void> => {
    try {
        const employeeId = req.user.id;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0] || "";
        const todayDate = new Date(todayStr);

        // Check if already clocked in
        const existingLog = await prisma.attendanceLog.findUnique({
            where: { employeeId_date: { employeeId, date: todayDate } }
        });

        if (existingLog) {
            res.status(400).json({ error: "Already clocked in today." });
            return;
        }

        const log = await prisma.attendanceLog.create({
            data: {
                employeeId,
                date: todayDate,
                clockIn: now,
                ipAddress: req.ip || req.connection.remoteAddress,
                status: "Present"
            }
        });

        res.status(201).json({ message: "Successfully clocked in.", log });
    } catch (error) {
        console.error("Clock In Error:", error);
        res.status(500).json({ error: "Failed to clock in." });
    }
};

export const clockOut = async (req: any, res: Response): Promise<void> => {
    try {
        const employeeId = req.user.id;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0] || "";
        const todayDate = new Date(todayStr);

        // Midnight Shift Handling: Look for yesterday's log if today's is missing
        let targetLog = await prisma.attendanceLog.findUnique({
            where: { employeeId_date: { employeeId, date: todayDate } }
        });

        if (!targetLog || targetLog.clockOut) {
            const yesterdayDate = new Date(todayDate);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayLog = await prisma.attendanceLog.findUnique({
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
        const isHoliday = await checkHoliday(employeeId, targetLog.date);
        if (isHoliday) status = "Holiday Working";

        const updatedLog = await prisma.attendanceLog.update({
            where: { id: targetLog.id },
            data: {
                clockOut: now,
                totalHours,
                status
            }
        });

        res.json({ message: "Successfully clocked out.", log: updatedLog });
    } catch (error) {
        console.error("Clock Out Error:", error);
        res.status(500).json({ error: "Failed to clock out." });
    }
};

export const getTodayStatus = async (req: any, res: Response): Promise<void> => {
    try {
        const employeeId = req.user.id;
        const todayStr = new Date().toISOString().split('T')[0] || "";
        const todayDate = new Date(todayStr);

        const log = await prisma.attendanceLog.findUnique({
            where: { employeeId_date: { employeeId, date: todayDate } }
        });

        res.json({ log });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch today's status." });
    }
};

export const getMonthlyAttendance = async (req: any, res: Response): Promise<void> => {
    try {
        const month = req.query.month as string; // YYYY-MM
        if (!month) {
            res.status(400).json({ error: "Month parameter (YYYY-MM) is required." });
            return;
        }

        const startDate = new Date(`${month}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const logs = await prisma.attendanceLog.findMany({
            where: {
                date: { gte: startDate, lt: endDate }
            },
            include: {
                employee: { select: { firstName: true, lastName: true, employeeId: true, department: true } }
            },
            orderBy: [{ employeeId: 'asc' }, { date: 'asc' }]
        });

        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch monthly report." });
    }
};
