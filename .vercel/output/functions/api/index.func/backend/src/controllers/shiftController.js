"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePenaltyRule = exports.getPenaltyRules = exports.createPenaltyRule = exports.updateShiftChangeStatus = exports.getShiftChangeRequests = exports.createShiftChangeRequest = exports.getShiftStats = exports.deleteRotation = exports.updateRotation = exports.getRotations = exports.createRotation = exports.deactivateAssignment = exports.getAssignments = exports.assignShift = exports.deleteShift = exports.updateShift = exports.getShiftById = exports.getShifts = exports.createShift = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// ─── HELPERS ─────────────────────────────────────────────────────────────────
const toInt = (val) => (val ? parseInt(String(val)) : undefined);
const toFloat = (val) => (val ? parseFloat(String(val)) : undefined);
// ─── SHIFTS ─────────────────────────────────────────────────────────────────
const createShift = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    try {
        const body = { ...req.body };
        // LOG REQUEST BODY FOR DEBUGGING
        console.log("Create Shift Request Body:", JSON.stringify(body, null, 2));
        // Sanitize optional unique string fields: empty string → null
        if (body.shiftCode === "" || body.shiftCode === undefined)
            body.shiftCode = null;
        if (body.department === "")
            body.department = null;
        if (body.description === "")
            body.description = null;
        if (body.breakStartTime === "")
            body.breakStartTime = null;
        if (body.breakEndTime === "")
            body.breakEndTime = null;
        if (body.weeklyOffDays === "")
            body.weeklyOffDays = null;
        if (body.halfDayOffDays === "")
            body.halfDayOffDays = null;
        // Sanitize optional numeric fields: empty string → null
        if (body.officeLatitude === "" || body.officeLatitude === undefined)
            body.officeLatitude = null;
        if (body.officeLongitude === "" || body.officeLongitude === undefined)
            body.officeLongitude = null;
        if (body.allowedRadiusM === "" || body.allowedRadiusM === undefined)
            body.allowedRadiusM = 200;
        if (body.overtimeRateType === "")
            body.overtimeRateType = "1.5x";
        // ONLY pick fields that exist in the Shift schema - strip unknown fields like weeklyOffPattern
        const shiftData = {
            name: (_a = body.shiftName) !== null && _a !== void 0 ? _a : body.name,
            start_time: (_b = body.startTime) !== null && _b !== void 0 ? _b : body.start_time,
            end_time: (_c = body.endTime) !== null && _c !== void 0 ? _c : body.end_time,
            grace_time_minutes: (_e = (_d = toInt(body.graceTime)) !== null && _d !== void 0 ? _d : toInt(body.grace_time)) !== null && _e !== void 0 ? _e : 0,
            half_day_min_hours: (_g = (_f = toFloat(body.halfDayHours)) !== null && _f !== void 0 ? _f : toFloat(body.halfDayMin)) !== null && _g !== void 0 ? _g : 4.0,
            full_day_min_hours: (_j = (_h = toFloat(body.fullDayHours)) !== null && _h !== void 0 ? _h : toFloat(body.fullDayMin)) !== null && _j !== void 0 ? _j : 8.0,
            break_duration_mins: (_l = (_k = toInt(body.breakDuration)) !== null && _k !== void 0 ? _k : toInt(body.break_duration_mins)) !== null && _l !== void 0 ? _l : 60,
            is_active: body.isActive !== undefined ? Boolean(body.isActive) : true,
        };
        // Only add optional fields if they exist in the schema
        if (body.nextDayGraceTime !== undefined)
            shiftData.nextDayGraceTime = body.nextDayGraceTime;
        console.log("Sanitized Shift Data:", JSON.stringify(shiftData, null, 2));
        const shift = await prisma_1.default.shift.create({ data: shiftData });
        res.status(201).json({ message: "Shift created successfully.", shift });
    }
    catch (err) {
        console.error("Create Shift Error:", err);
        // Extract Prisma error details in a safer way
        let errorDetails = {};
        if (err.code === "P2002") {
            errorDetails = { type: "Unique constraint violation", field: (_m = err.meta) === null || _m === void 0 ? void 0 : _m.target };
        }
        else if (err.code === "P2003") {
            errorDetails = { type: "Foreign key constraint failed", field: (_o = err.meta) === null || _o === void 0 ? void 0 : _o.field_name };
        }
        else if (err.code === "P2012") {
            errorDetails = { type: "Missing required field", field: (_p = err.meta) === null || _p === void 0 ? void 0 : _p.fields };
        }
        else {
            errorDetails = { type: err.code || "Unknown error", message: err.message };
        }
        res.status(500).json({
            error: err.message || "Failed to create shift.",
            details: errorDetails,
            prismaCode: err.code
        });
    }
};
exports.createShift = createShift;
const getShifts = async (_req, res) => {
    try {
        const shifts = await prisma_1.default.shift.findMany({
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { ShiftAssignment: true } } }
        });
        res.json({ shifts });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch shifts." });
    }
};
exports.getShifts = getShifts;
const getShiftById = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        const shift = await prisma_1.default.shift.findUnique({
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
        if (!shift) {
            res.status(404).json({ error: "Shift not found." });
            return;
        }
        res.json({ shift });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch shift." });
    }
};
exports.getShiftById = getShiftById;
const updateShift = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const id = toInt(req.params["id"]);
        const body = { ...req.body };
        // Sanitize optional unique string fields: empty string → null
        if (body.shiftCode === "")
            body.shiftCode = null;
        if (body.department === "")
            body.department = null;
        if (body.description === "")
            body.description = null;
        if (body.breakStartTime === "")
            body.breakStartTime = null;
        if (body.breakEndTime === "")
            body.breakEndTime = null;
        if (body.weeklyOffDays === "")
            body.weeklyOffDays = null;
        if (body.halfDayOffDays === "")
            body.halfDayOffDays = null;
        // Sanitize optional numeric fields: empty string → null
        if (body.officeLatitude === "")
            body.officeLatitude = null;
        if (body.officeLongitude === "")
            body.officeLongitude = null;
        if (body.allowedRadiusM === "")
            body.allowedRadiusM = 200;
        const shiftData = {};
        const fieldMap = {
            name: (_a = body.name) !== null && _a !== void 0 ? _a : body.shiftName,
            start_time: (_b = body.startTime) !== null && _b !== void 0 ? _b : body.start_time,
            end_time: (_c = body.endTime) !== null && _c !== void 0 ? _c : body.end_time,
            grace_time_minutes: (_d = toInt(body.graceTime)) !== null && _d !== void 0 ? _d : toInt(body.grace_time),
            half_day_min_hours: (_e = toFloat(body.halfDayHours)) !== null && _e !== void 0 ? _e : toFloat(body.halfDayMin),
            full_day_min_hours: (_f = toFloat(body.fullDayHours)) !== null && _f !== void 0 ? _f : toFloat(body.fullDayMin),
            break_duration_mins: (_g = toInt(body.breakDuration)) !== null && _g !== void 0 ? _g : toInt(body.break_duration_mins),
            is_active: (_h = body.isActive) !== null && _h !== void 0 ? _h : body.is_active,
        };
        Object.entries(fieldMap).forEach(([field, value]) => {
            if (value !== undefined) {
                shiftData[field] = value;
            }
        });
        const shift = await prisma_1.default.shift.update({ where: { id }, data: shiftData });
        res.json({ message: "Shift updated successfully.", shift });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to update shift." });
    }
};
exports.updateShift = updateShift;
const deleteShift = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        await prisma_1.default.shift.delete({ where: { id } });
        res.json({ message: "Shift deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete shift." });
    }
};
exports.deleteShift = deleteShift;
// ─── SHIFT ASSIGNMENTS ───────────────────────────────────────────────────────
const assignShift = async (req, res) => {
    try {
        const { employeeIds, shiftId, startDate, endDate, assignedBy } = req.body;
        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            res.status(400).json({ error: "employeeIds array is required." });
            return;
        }
        const assignments = await Promise.all(employeeIds.map((empId) => prisma_1.default.shiftAssignment.upsert({
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
        })));
        res.status(201).json({ message: `${assignments.length} assignment(s) saved.`, assignments });
    }
    catch (err) {
        console.error("Assign Shift Error:", err);
        res.status(500).json({ error: err.message || "Failed to assign shift.", details: err });
    }
};
exports.assignShift = assignShift;
const getAssignments = async (req, res) => {
    try {
        // Explicitly extract as string to avoid string | string[] | ParsedQs errors
        const shiftId = req.query["shiftId"];
        const departmentName = req.query["departmentName"];
        const where = {};
        if (shiftId)
            where.shiftId = toInt(shiftId);
        const assignments = await prisma_1.default.shiftAssignment.findMany({
            where,
            include: {
                shift: { select: { name: true, start_time: true, end_time: true } },
                employee: { select: { firstName: true, lastName: true, employeeId: true, department: true } }
            },
            orderBy: { startDate: "desc" }
        });
        const filtered = departmentName
            ? assignments.filter((a) => a.employee.department === departmentName)
            : assignments;
        res.json({ assignments: filtered });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch assignments." });
    }
};
exports.getAssignments = getAssignments;
const deactivateAssignment = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        const assignment = await prisma_1.default.shiftAssignment.update({
            where: { id },
            data: { isActive: false, endDate: new Date() }
        });
        res.json({ message: "Assignment deactivated.", assignment });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to deactivate assignment." });
    }
};
exports.deactivateAssignment = deactivateAssignment;
// ─── SHIFT ROTATIONS ─────────────────────────────────────────────────────────
const createRotation = async (req, res) => {
    try {
        const rotation = await prisma_1.default.shiftRotation.create({
            data: {
                ...req.body,
                cycleStartDate: new Date(String(req.body.cycleStartDate)),
                shiftSequence: JSON.stringify(req.body.shiftSequence)
            }
        });
        res.status(201).json({ message: "Rotation created.", rotation });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to create rotation." });
    }
};
exports.createRotation = createRotation;
const getRotations = async (_req, res) => {
    try {
        const rotations = await prisma_1.default.shiftRotation.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ rotations });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch rotations." });
    }
};
exports.getRotations = getRotations;
const updateRotation = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        const data = { ...req.body };
        if (req.body.cycleStartDate)
            data.cycleStartDate = new Date(String(req.body.cycleStartDate));
        if (req.body.shiftSequence)
            data.shiftSequence = JSON.stringify(req.body.shiftSequence);
        const rotation = await prisma_1.default.shiftRotation.update({ where: { id }, data });
        res.json({ message: "Rotation updated.", rotation });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update rotation." });
    }
};
exports.updateRotation = updateRotation;
const deleteRotation = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        await prisma_1.default.shiftRotation.delete({ where: { id } });
        res.json({ message: "Rotation deleted." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete rotation." });
    }
};
exports.deleteRotation = deleteRotation;
// ─── SHIFT STATS / REPORTS ────────────────────────────────────────────────────
const getShiftStats = async (_req, res) => {
    try {
        const [totalShifts, activeAssignments, totalRotations, shiftList] = await Promise.all([
            prisma_1.default.shift.count(),
            prisma_1.default.shiftAssignment.count({ where: { isActive: true } }),
            prisma_1.default.shiftRotation.count(),
            prisma_1.default.shift.findMany({
                select: { name: true, _count: { select: { ShiftAssignment: true } } }
            })
        ]);
        res.json({ totalShifts, activeAssignments, totalRotations, shiftList });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch shift stats." });
    }
}; // ─── SHIFT CHANGE REQUESTS ──────────────────────────────────────────────────
exports.getShiftStats = getShiftStats;
const createShiftChangeRequest = async (req, res) => {
    try {
        const { employeeId, requestedShiftId, date, reason } = req.body;
        const request = await prisma_1.default.shiftChangeRequest.create({
            data: {
                employeeId: toInt(employeeId),
                requestedShiftId: toInt(requestedShiftId),
                date: new Date(date),
                reason,
                status: "Pending"
            }
        });
        res.status(201).json({ message: "Shift change request submitted.", request });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to submit shift change request." });
    }
};
exports.createShiftChangeRequest = createShiftChangeRequest;
const getShiftChangeRequests = async (_req, res) => {
    try {
        const requests = await prisma_1.default.shiftChangeRequest.findMany({
            include: {
                employee: { select: { firstName: true, lastName: true, employeeId: true } },
                requestedShift: { select: { name: true, start_time: true, end_time: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ requests });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch shift change requests." });
    }
};
exports.getShiftChangeRequests = getShiftChangeRequests;
const updateShiftChangeStatus = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        const { status } = req.body; // Approved / Rejected
        const request = await prisma_1.default.shiftChangeRequest.update({
            where: { id },
            data: { status }
        });
        // If approved, we could optionally create a ShiftAssignment for that specific date
        // But usually, attendance logic should just check for approved ShiftChangeRequests
        res.json({ message: `Shift change ${status.toLowerCase()}.`, request });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update shift change request status." });
    }
};
exports.updateShiftChangeStatus = updateShiftChangeStatus;
// ─── SHIFT PENALTY RULES ─────────────────────────────────────────────────────
const createPenaltyRule = async (req, res) => {
    try {
        const { name, type, thresholdMin, deductionAmt, dayDeduction, status } = req.body;
        const rule = await prisma_1.default.shiftPenaltyRule.create({
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
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to create penalty rule." });
    }
};
exports.createPenaltyRule = createPenaltyRule;
const getPenaltyRules = async (_req, res) => {
    try {
        const rules = await prisma_1.default.shiftPenaltyRule.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ rules });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch penalty rules." });
    }
};
exports.getPenaltyRules = getPenaltyRules;
const deletePenaltyRule = async (req, res) => {
    try {
        const id = toInt(req.params["id"]);
        await prisma_1.default.shiftPenaltyRule.delete({ where: { id } });
        res.json({ message: "Penalty rule deleted." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete penalty rule." });
    }
};
exports.deletePenaltyRule = deletePenaltyRule;
//# sourceMappingURL=shiftController.js.map