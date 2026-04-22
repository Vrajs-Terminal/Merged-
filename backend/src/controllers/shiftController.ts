import type { Request, Response } from "express";
import db from "../config/prisma";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const toInt = (val: any) => (val ? parseInt(String(val)) : undefined);
const toFloat = (val: any) => (val ? parseFloat(String(val)) : undefined);

// ─── SHIFTS ─────────────────────────────────────────────────────────────────

export const createShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = { ...req.body };
        
        // LOG REQUEST BODY FOR DEBUGGING
        console.log("Create Shift Request Body:", JSON.stringify(body, null, 2));
        
        // Sanitize optional unique string fields: empty string → null
        if (body.shiftCode === "" || body.shiftCode === undefined) body.shiftCode = null;
        if (body.department === "") body.department = null;
        if (body.description === "") body.description = null;
        if (body.breakStartTime === "") body.breakStartTime = null;
        if (body.breakEndTime === "") body.breakEndTime = null;
        if (body.weeklyOffDays === "") body.weeklyOffDays = null;
        if (body.halfDayOffDays === "") body.halfDayOffDays = null;
        
        // Sanitize optional numeric fields: empty string → null
        if (body.officeLatitude === "" || body.officeLatitude === undefined) body.officeLatitude = null;
        if (body.officeLongitude === "" || body.officeLongitude === undefined) body.officeLongitude = null;
        if (body.allowedRadiusM === "" || body.allowedRadiusM === undefined) body.allowedRadiusM = 200;
        if (body.overtimeRateType === "") body.overtimeRateType = "1.5x";
        
        // ONLY pick fields that exist in the Shift schema - strip unknown fields like weeklyOffPattern
        const shiftData: any = {
            name: body.shiftName ?? body.name,
            start_time: body.startTime ?? body.start_time,
            end_time: body.endTime ?? body.end_time,
            grace_time_minutes: toInt(body.graceTime) ?? toInt(body.grace_time) ?? 0,
            half_day_min_hours: toFloat(body.halfDayHours) ?? toFloat(body.halfDayMin) ?? 4.0,
            full_day_min_hours: toFloat(body.fullDayHours) ?? toFloat(body.fullDayMin) ?? 8.0,
            break_duration_mins: toInt(body.breakDuration) ?? toInt(body.break_duration_mins) ?? 60,
            is_active: body.isActive !== undefined ? Boolean(body.isActive) : true,
        };

        // Only add optional fields if they exist in the schema
        if (body.nextDayGraceTime !== undefined) shiftData.nextDayGraceTime = body.nextDayGraceTime;
        
        console.log("Sanitized Shift Data:", JSON.stringify(shiftData, null, 2));
        
        const shift = await db.shift.create({ data: shiftData });
        res.status(201).json({ message: "Shift created successfully.", shift });
    } catch (err: any) {
        console.error("Create Shift Error:", err);
        
        // Extract Prisma error details in a safer way
        let errorDetails: any = {};
        if (err.code === "P2002") {
            errorDetails = { type: "Unique constraint violation", field: err.meta?.target };
        } else if (err.code === "P2003") {
            errorDetails = { type: "Foreign key constraint failed", field: err.meta?.field_name };
        } else if (err.code === "P2012") {
            errorDetails = { type: "Missing required field", field: err.meta?.fields };
        } else {
            errorDetails = { type: err.code || "Unknown error", message: err.message };
        }
        
        res.status(500).json({ 
            error: err.message || "Failed to create shift.",
            details: errorDetails,
            prismaCode: err.code
        });
    }
};

export const getShifts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const shifts = await db.shift.findMany({
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { ShiftAssignment: true } } }
        });
        res.json({ shifts });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch shifts." });
    }
};

export const getShiftById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        const shift = await db.shift.findUnique({
            where: { id },
            include: {
                ShiftAssignment: {
                    include: {
                        employee: {
                            select: { firstName: true, lastName: true, employeeId: true, department: true }
                        }
                    }
                }
            }
        });
        if (!shift) { res.status(404).json({ error: "Shift not found." }); return; }
        res.json({ shift });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch shift." });
    }
};

export const updateShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        const body = { ...req.body };

        // Sanitize optional unique string fields: empty string → null
        if (body.shiftCode === "") body.shiftCode = null;
        if (body.department === "") body.department = null;
        if (body.description === "") body.description = null;
        if (body.breakStartTime === "") body.breakStartTime = null;
        if (body.breakEndTime === "") body.breakEndTime = null;
        if (body.weeklyOffDays === "") body.weeklyOffDays = null;
        if (body.halfDayOffDays === "") body.halfDayOffDays = null;
        
        // Sanitize optional numeric fields: empty string → null
        if (body.officeLatitude === "") body.officeLatitude = null;
        if (body.officeLongitude === "") body.officeLongitude = null;
        if (body.allowedRadiusM === "") body.allowedRadiusM = 200;

        const shiftData: any = {};
        const fieldMap: Record<string, any> = {
            name: body.name ?? body.shiftName,
            start_time: body.startTime ?? body.start_time,
            end_time: body.endTime ?? body.end_time,
            grace_time_minutes: toInt(body.graceTime) ?? toInt(body.grace_time),
            half_day_min_hours: toFloat(body.halfDayHours) ?? toFloat(body.halfDayMin),
            full_day_min_hours: toFloat(body.fullDayHours) ?? toFloat(body.fullDayMin),
            break_duration_mins: toInt(body.breakDuration) ?? toInt(body.break_duration_mins),
            is_active: body.isActive ?? body.is_active,
        };

        Object.entries(fieldMap).forEach(([field, value]) => {
            if (value !== undefined) {
                shiftData[field] = value;
            }
        });

        const shift = await db.shift.update({ where: { id }, data: shiftData });
        res.json({ message: "Shift updated successfully.", shift });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to update shift." });
    }
};

export const deleteShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        await db.shift.delete({ where: { id } });
        res.json({ message: "Shift deleted successfully." });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to delete shift." });
    }
};

// ─── SHIFT ASSIGNMENTS ───────────────────────────────────────────────────────

export const assignShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employeeIds, shiftId, startDate, endDate, assignedBy } = req.body;

        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            res.status(400).json({ error: "employeeIds array is required." });
            return;
        }

        const assignments = await Promise.all(
            employeeIds.map((empId: number) =>
                db.shiftAssignment.upsert({
                    where: {
                        employeeId_shiftId_startDate: {
                            employeeId: empId,
                            shiftId,
                            startDate: new Date(startDate)
                        }
                    },
                    update: {
                        shiftId,
                        endDate: endDate ? new Date(endDate) : null,
                        isActive: true,
                        assignedBy
                    },
                    create: {
                        employeeId: empId,
                        shiftId,
                        startDate: new Date(startDate),
                        endDate: endDate ? new Date(endDate) : null,
                        isActive: true,
                        assignedBy
                    }
                })
            )
        );

        res.status(201).json({ message: `${assignments.length} assignment(s) saved.`, assignments });
    } catch (err: any) {
        console.error("Assign Shift Error:", err);
        res.status(500).json({ error: err.message || "Failed to assign shift.", details: err });
    }
};

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        // Explicitly extract as string to avoid string | string[] | ParsedQs errors
        const shiftId: string | undefined = req.query["shiftId"] as string | undefined;
        const departmentName: string | undefined = req.query["departmentName"] as string | undefined;

        const where: any = {};
        if (shiftId) where.shiftId = toInt(shiftId);

        const assignments: any[] = await db.shiftAssignment.findMany({
            where,
            include: {
                shift: { select: { name: true, start_time: true, end_time: true } },
                employee: { select: { firstName: true, lastName: true, employeeId: true, department: true } }
            },
            orderBy: { startDate: "desc" }
        });

        const filtered = departmentName
            ? assignments.filter((a: any) => a.employee.department === departmentName)
            : assignments;

        res.json({ assignments: filtered });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch assignments." });
    }
};

export const deactivateAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        const assignment = await db.shiftAssignment.update({
            where: { id },
            data: { isActive: false, endDate: new Date() }
        });
        res.json({ message: "Assignment deactivated.", assignment });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to deactivate assignment." });
    }
};

// ─── SHIFT ROTATIONS ─────────────────────────────────────────────────────────

export const createRotation = async (req: Request, res: Response): Promise<void> => {
    try {
        const rotation = await db.shiftRotation.create({
            data: {
                ...req.body,
                cycleStartDate: new Date(String(req.body.cycleStartDate)),
                shiftSequence: JSON.stringify(req.body.shiftSequence)
            }
        });
        res.status(201).json({ message: "Rotation created.", rotation });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to create rotation." });
    }
};

export const getRotations = async (_req: Request, res: Response): Promise<void> => {
    try {
        const rotations = await db.shiftRotation.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ rotations });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch rotations." });
    }
};

export const updateRotation = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        const data: any = { ...req.body };
        if (req.body.cycleStartDate) data.cycleStartDate = new Date(String(req.body.cycleStartDate));
        if (req.body.shiftSequence) data.shiftSequence = JSON.stringify(req.body.shiftSequence);
        const rotation = await db.shiftRotation.update({ where: { id }, data });
        res.json({ message: "Rotation updated.", rotation });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to update rotation." });
    }
};

export const deleteRotation = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        await db.shiftRotation.delete({ where: { id } });
        res.json({ message: "Rotation deleted." });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to delete rotation." });
    }
};

// ─── SHIFT STATS / REPORTS ────────────────────────────────────────────────────

export const getShiftStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [totalShifts, activeAssignments, totalRotations, shiftList] = await Promise.all([
            db.shift.count(),
            db.shiftAssignment.count({ where: { isActive: true } }),
            db.shiftRotation.count(),
            db.shift.findMany({
                select: { name: true, _count: { select: { ShiftAssignment: true } } }
            })
        ]);
        res.json({ totalShifts, activeAssignments, totalRotations, shiftList });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch shift stats." });
    }
};// ─── SHIFT CHANGE REQUESTS ──────────────────────────────────────────────────

export const createShiftChangeRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employeeId, requestedShiftId, date, reason } = req.body;
        const request = await db.shiftChangeRequest.create({
            data: {
                employeeId: toInt(employeeId)!,
                requestedShiftId: toInt(requestedShiftId)!,
                date: new Date(date),
                reason,
                status: "Pending"
            }
        });
        res.status(201).json({ message: "Shift change request submitted.", request });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to submit shift change request." });
    }
};

export const getShiftChangeRequests = async (_req: Request, res: Response): Promise<void> => {
    try {
        const requests = await db.shiftChangeRequest.findMany({
            include: {
                employee: { select: { firstName: true, lastName: true, employeeId: true } },
                requestedShift: { select: { name: true, start_time: true, end_time: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ requests });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch shift change requests." });
    }
};

export const updateShiftChangeStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        const { status } = req.body; // Approved / Rejected
        
        const request = await db.shiftChangeRequest.update({
            where: { id },
            data: { status }
        });

        // If approved, we could optionally create a ShiftAssignment for that specific date
        // But usually, attendance logic should just check for approved ShiftChangeRequests
        
        res.json({ message: `Shift change ${status.toLowerCase()}.`, request });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to update shift change request status." });
    }
};

// ─── SHIFT PENALTY RULES ─────────────────────────────────────────────────────

export const createPenaltyRule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, type, thresholdMin, deductionAmt, dayDeduction, status } = req.body;
        const rule = await db.shiftPenaltyRule.create({
            data: {
                name,
                type,
                thresholdMin: parseInt(String(thresholdMin)) || 15,
                deductionAmt: parseFloat(String(deductionAmt)) || 0,
                dayDeduction: parseFloat(String(dayDeduction)) || 0,
                status: status || "Active"
            }
        });
        res.status(201).json({ message: "Penalty rule created.", rule });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to create penalty rule." });
    }
};

export const getPenaltyRules = async (_req: Request, res: Response): Promise<void> => {
    try {
        const rules = await db.shiftPenaltyRule.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ rules });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch penalty rules." });
    }
};

export const deletePenaltyRule = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = toInt(req.params["id"]);
        await db.shiftPenaltyRule.delete({ where: { id } });
        res.json({ message: "Penalty rule deleted." });
    } catch (err: any) {
        res.status(500).json({ error: "Failed to delete penalty rule." });
    }
};
