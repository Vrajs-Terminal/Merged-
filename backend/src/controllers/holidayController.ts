import type { Request, Response } from "express";
import db from "../config/prisma";

// Helper for numeric conversion
const toInt = (val: any) => (val ? parseInt(String(val)) : undefined);

// ─── HOLIDAYS ────────────────────────────────────────────────────────────────

export const createHoliday = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, date, type, year, description } = req.body;
        const holiday = await db.holiday.create({
            data: {
                name,
                date: new Date(date),
                type: type || "Public",
                year: toInt(year) || new Date(date).getFullYear(),
                description
            }
        });
        res.status(201).json({ message: "Holiday created successfully.", holiday });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to create holiday." });
    }
};

export const getHolidays = async (req: Request, res: Response): Promise<void> => {
    try {
        const holidays = await db.holiday.findMany({
            orderBy: { date: "asc" },
            include: { assignments: true }
        });
        res.json({ holidays });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch holidays." });
    }
};

export const deleteHoliday = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        await db.holiday.delete({ where: { id } });
        res.json({ message: "Holiday deleted successfully." });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to delete holiday." });
    }
};

// ─── HOLIDAY ASSIGNMENTS ─────────────────────────────────────────────────────

export const assignHoliday = async (req: Request, res: Response): Promise<void> => {
    try {
        const { holidayId, targetType, targetIds } = req.body; // targetType: Company, Branch, Department, Employee
        
        if (!Array.isArray(targetIds) || targetIds.length === 0) {
            // Single assignment if targetId is provided instead of array
            if (req.body.targetId) {
                const assignment = await db.holidayAssignment.create({
                    data: {
                        holidayId: toInt(holidayId)!,
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

        const assignments = await Promise.all(
            targetIds.map((tid: number) =>
                db.holidayAssignment.create({
                    data: {
                        holidayId: toInt(holidayId)!,
                        targetType,
                        targetId: toInt(tid)
                    }
                })
            )
        );

        res.status(201).json({ message: `${assignments.length} assignment(s) created.`, assignments });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to assign holiday." });
    }
};

// ─── HOLIDAY EXCHANGE REQUESTS ────────────────────────────────────────────────

export const createExchangeRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employeeId, originalHolidayId, exchangeDate, reason } = req.body;
        const request = await db.holidayExchangeRequest.create({
            data: {
                employeeId: toInt(employeeId)!,
                originalHolidayId: toInt(originalHolidayId)!,
                exchangeDate: new Date(exchangeDate),
                reason,
                status: "Pending"
            }
        });
        res.status(201).json({ message: "Exchange request submitted.", request });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to submit request." });
    }
};

export const getExchangeRequests = async (_req: Request, res: Response): Promise<void> => {
    try {
        const requests = await db.holidayExchangeRequest.findMany({
            include: {
                employee: { select: { firstName: true, lastName: true, employeeId: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ requests });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch requests." });
    }
};

export const updateExchangeStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        const { status } = req.body; // Approved / Rejected
        const request = await db.holidayExchangeRequest.update({
            where: { id },
            data: { status }
        });
        res.json({ message: `Request ${status.toLowerCase()}.`, request });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to update request status." });
    }
};
