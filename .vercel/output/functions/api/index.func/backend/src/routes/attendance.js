"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
/**
 * Utility: Calculate late minutes based on shift
 */
function calculateLateMinutes(punchIn, shiftStartTimeStr, graceMinutes) {
    const [shiftHour, shiftMin] = shiftStartTimeStr.split(':').map(Number);
    const expectedStart = new Date(punchIn);
    expectedStart.setHours(shiftHour, shiftMin, 0, 0);
    const allowedStart = new Date(expectedStart.getTime() + graceMinutes * 60000);
    if (punchIn > allowedStart) {
        return Math.floor((punchIn.getTime() - expectedStart.getTime()) / 60000);
    }
    return 0;
}
/**
 * Web Punch (In or Out)
 */
router.post('/web-punch', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const now = new Date();
        const dateOnlyStr = now.toISOString().split('T')[0];
        const dateObj = new Date(dateOnlyStr);
        const employee = await prismaClient_1.default.user.findUnique({
            where: { id: user.id },
            include: { shift: true }
        });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        let record = await prismaClient_1.default.attendanceRecord.findUnique({
            where: { user_id_date: { user_id: user.id, date: dateObj } }
        });
        if (!record) {
            // PUNCH IN
            let lateMins = 0;
            if (employee.shift) {
                lateMins = calculateLateMinutes(now, employee.shift.start_time, employee.shift.grace_time_minutes);
            }
            const initialStatus = lateMins > 0 ? "Late" : "Present";
            record = await prismaClient_1.default.attendanceRecord.create({
                data: {
                    user_id: user.id,
                    date: dateObj,
                    in_time: now,
                    status: initialStatus,
                    late_by_minutes: lateMins,
                    source: 'Web',
                    remarks: lateMins > 0 ? `Late by ${lateMins} mins` : null
                }
            });
            await (0, activityLogger_1.logActivity)(user.id, 'CREATED', 'ATTENDANCE_PUNCH_IN', 'Web Punch In');
            return res.json({ message: 'Punched In Successfully!', record });
        }
        else if (record.in_time && !record.out_time) {
            // PUNCH OUT
            const grossMs = now.getTime() - record.in_time.getTime();
            let netWorkingMinutes = Math.floor(grossMs / 60000);
            if (employee.shift && netWorkingMinutes > (employee.shift.break_duration_mins * 2)) {
                netWorkingMinutes -= employee.shift.break_duration_mins;
                record.break_minutes = employee.shift.break_duration_mins;
            }
            const netWorkingHours = parseFloat((netWorkingMinutes / 60).toFixed(2));
            let overtimeHours = 0;
            let finalStatus = record.status;
            if (employee.shift) {
                if (netWorkingHours > employee.shift.full_day_min_hours) {
                    overtimeHours = parseFloat((netWorkingHours - employee.shift.full_day_min_hours).toFixed(2));
                }
                else if (netWorkingHours < employee.shift.half_day_min_hours) {
                    finalStatus = "Half Day";
                }
            }
            record = await prismaClient_1.default.attendanceRecord.update({
                where: { id: record.id },
                data: {
                    out_time: now,
                    total_working_hours: netWorkingHours,
                    overtime_hours: overtimeHours,
                    break_minutes: record.break_minutes,
                    status: finalStatus
                }
            });
            await (0, activityLogger_1.logActivity)(user.id, 'UPDATED', 'ATTENDANCE_PUNCH_OUT', 'Web Punch Out');
            return res.json({ message: 'Punched Out Successfully!', record });
        }
        else {
            return res.status(400).json({ error: 'You have already punched in and out for today.' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process punch', details: error.message });
    }
});
/**
 * Get Attendance Records (With Filters)
 */
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { date, start_date, end_date, user_id, status, department_id, branch_id } = req.query;
        const user = req.user;
        const whereClause = {};
        if (date) {
            whereClause.date = new Date(date);
        }
        else if (start_date && end_date) {
            whereClause.date = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }
        if (user_id)
            whereClause.user_id = parseInt(user_id);
        if (status)
            whereClause.status = status;
        // Branch/Department filter via nested user relation
        if (branch_id || department_id) {
            whereClause.user = {};
            if (branch_id)
                whereClause.user.branch_id = parseInt(branch_id);
            if (department_id)
                whereClause.user.department_id = parseInt(department_id);
        }
        // Security silo: regular employees see only their own
        if (user.role !== 'Admin' && user.role !== 'Super Admin') {
            whereClause.user_id = user.id;
        }
        const records = await prismaClient_1.default.attendanceRecord.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true, name: true, email: true,
                        department: { select: { name: true } },
                        branch: { select: { name: true } },
                        shift: true
                    }
                }
            },
            orderBy: { date: 'desc' },
            take: 500
        });
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
    }
});
/**
 * Dashboard Stats for Attendance Module
 */
router.get('/dashboard-stats', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { date: dateStr } = req.query;
        const targetDate = dateStr ? new Date(dateStr) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const totalEmployees = await prismaClient_1.default.user.count();
        const statusCounts = await prismaClient_1.default.attendanceRecord.groupBy({
            by: ['status'],
            where: { date: targetDate },
            _count: { status: true }
        });
        const countMap = {};
        statusCounts.forEach(s => { countMap[s.status] = s._count.status; });
        // Weekly trend data (last 5 working days)
        const weeklyData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 4; i >= 0; i--) {
            const d = new Date(targetDate);
            d.setDate(d.getDate() - i);
            const dayCounts = await prismaClient_1.default.attendanceRecord.groupBy({
                by: ['status'],
                where: { date: d },
                _count: { status: true }
            });
            const dayMap = {};
            dayCounts.forEach(s => { dayMap[s.status] = s._count.status; });
            weeklyData.push({
                name: dayNames[d.getDay()],
                date: d.toISOString().split('T')[0],
                Present: (dayMap['Present'] || 0) + (dayMap['Late'] || 0),
                Absent: dayMap['Absent'] || 0,
                Late: dayMap['Late'] || 0
            });
        }
        res.json({
            total: totalEmployees,
            present: (countMap['Present'] || 0) + (countMap['Late'] || 0),
            absent: countMap['Absent'] || 0,
            late: countMap['Late'] || 0,
            onLeave: countMap['Leave'] || 0,
            halfDay: countMap['Half Day'] || 0,
            wfh: countMap['WFH'] || 0,
            weekOff: countMap['WeekOff'] || 0,
            holiday: countMap['Holiday'] || 0,
            missingPunch: countMap['MissingPunch'] || 0,
            weeklyTrend: weeklyData
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance stats', details: error.message });
    }
});
/**
 * Month-Wise Attendance Summary
 */
router.get('/month-wise', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { year, month } = req.query;
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || (new Date().getMonth() + 1);
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0); // last day of month
        const user = req.user;
        const whereClause = {
            date: { gte: startDate, lte: endDate }
        };
        if (user.role !== 'Admin' && user.role !== 'Super Admin') {
            whereClause.user_id = user.id;
        }
        const records = await prismaClient_1.default.attendanceRecord.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true, name: true,
                        department: { select: { name: true } },
                        branch: { select: { name: true } }
                    }
                }
            },
            orderBy: [{ user_id: 'asc' }, { date: 'asc' }]
        });
        // Group by employee
        const grouped = {};
        records.forEach(r => {
            const uid = r.user_id;
            if (!grouped[uid]) {
                grouped[uid] = {
                    employee: r.user,
                    days: {},
                    summary: { present: 0, absent: 0, late: 0, halfDay: 0, leave: 0, totalHours: 0 }
                };
            }
            const dayNum = new Date(r.date).getDate();
            grouped[uid].days[dayNum] = { status: r.status, hours: r.total_working_hours };
            if (r.status === 'Present' || r.status === 'Late')
                grouped[uid].summary.present++;
            if (r.status === 'Absent')
                grouped[uid].summary.absent++;
            if (r.status === 'Late')
                grouped[uid].summary.late++;
            if (r.status === 'Half Day')
                grouped[uid].summary.halfDay++;
            if (r.status === 'Leave')
                grouped[uid].summary.leave++;
            grouped[uid].summary.totalHours += r.total_working_hours;
        });
        res.json({
            year: y,
            month: m,
            daysInMonth: endDate.getDate(),
            employees: Object.values(grouped)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch month-wise data', details: error.message });
    }
});
/**
 * Weekly Attendance
 */
router.get('/weekly', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { start_date } = req.query;
        const startOfWeek = start_date ? new Date(start_date) : new Date();
        // Go to Monday
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        const user = req.user;
        const whereClause = {
            date: { gte: startOfWeek, lte: endOfWeek }
        };
        if (user.role !== 'Admin' && user.role !== 'Super Admin') {
            whereClause.user_id = user.id;
        }
        const records = await prismaClient_1.default.attendanceRecord.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true, name: true,
                        department: { select: { name: true } },
                        branch: { select: { name: true } }
                    }
                }
            },
            orderBy: [{ user_id: 'asc' }, { date: 'asc' }]
        });
        res.json({
            weekStart: startOfWeek.toISOString().split('T')[0],
            weekEnd: endOfWeek.toISOString().split('T')[0],
            records
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch weekly data', details: error.message });
    }
});
/**
 * Manual Attendance Entry (Admin)
 */
router.post('/manual', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const adminUser = req.user;
        if (adminUser.role !== 'Admin' && adminUser.role !== 'Super Admin') {
            return res.status(403).json({ error: 'Only admins can add manual attendance' });
        }
        const { user_id, date, in_time, out_time, remarks } = req.body;
        if (!user_id || !date || !in_time) {
            return res.status(400).json({ error: 'user_id, date, and in_time are required' });
        }
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        // Check for existing record
        const existing = await prismaClient_1.default.attendanceRecord.findUnique({
            where: { user_id_date: { user_id: parseInt(user_id), date: dateObj } }
        });
        if (existing) {
            return res.status(400).json({ error: 'Attendance record already exists for this employee on this date' });
        }
        const employee = await prismaClient_1.default.user.findUnique({
            where: { id: parseInt(user_id) },
            include: { shift: true }
        });
        if (!employee)
            return res.status(404).json({ error: 'Employee not found' });
        // Parse times
        const [inH, inM] = in_time.split(':').map(Number);
        const inDateTime = new Date(dateObj);
        inDateTime.setHours(inH, inM, 0, 0);
        let outDateTime = null;
        let totalHours = 0;
        let lateMins = 0;
        let overtimeHours = 0;
        let status = 'Present';
        if (employee.shift) {
            lateMins = calculateLateMinutes(inDateTime, employee.shift.start_time, employee.shift.grace_time_minutes);
            if (lateMins > 0)
                status = 'Late';
        }
        if (out_time) {
            const [outH, outM] = out_time.split(':').map(Number);
            outDateTime = new Date(dateObj);
            outDateTime.setHours(outH, outM, 0, 0);
            let netMins = Math.floor((outDateTime.getTime() - inDateTime.getTime()) / 60000);
            if (employee.shift && netMins > employee.shift.break_duration_mins * 2) {
                netMins -= employee.shift.break_duration_mins;
            }
            totalHours = parseFloat((netMins / 60).toFixed(2));
            if (employee.shift) {
                if (totalHours > employee.shift.full_day_min_hours) {
                    overtimeHours = parseFloat((totalHours - employee.shift.full_day_min_hours).toFixed(2));
                }
                else if (totalHours < employee.shift.half_day_min_hours) {
                    status = 'Half Day';
                }
            }
        }
        const record = await prismaClient_1.default.attendanceRecord.create({
            data: {
                user_id: parseInt(user_id),
                date: dateObj,
                in_time: inDateTime,
                out_time: outDateTime,
                total_working_hours: totalHours,
                late_by_minutes: lateMins,
                overtime_hours: overtimeHours,
                status,
                source: 'Manual',
                remarks: remarks || `Manual entry by admin`
            }
        });
        await (0, activityLogger_1.logActivity)(adminUser.id, 'CREATED', 'ATTENDANCE_MANUAL', `Manual attendance for user ${user_id}`);
        res.status(201).json({ message: 'Manual attendance added successfully', record });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add manual attendance', details: error.message });
    }
});
/**
 * Update Attendance Record (Admin)
 */
router.put('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const adminUser = req.user;
        if (adminUser.role !== 'Admin' && adminUser.role !== 'Super Admin') {
            return res.status(403).json({ error: 'Only admins can update attendance' });
        }
        const { id } = req.params;
        const { in_time, out_time, status, remarks, break_minutes } = req.body;
        const existing = await prismaClient_1.default.attendanceRecord.findUnique({ where: { id: parseInt(id) } });
        if (!existing)
            return res.status(404).json({ error: 'Record not found' });
        const updateData = {};
        if (in_time) {
            const [h, m] = in_time.split(':').map(Number);
            const dt = new Date(existing.date);
            dt.setHours(h, m, 0, 0);
            updateData.in_time = dt;
        }
        if (out_time) {
            const [h, m] = out_time.split(':').map(Number);
            const dt = new Date(existing.date);
            dt.setHours(h, m, 0, 0);
            updateData.out_time = dt;
        }
        if (status)
            updateData.status = status;
        if (remarks !== undefined)
            updateData.remarks = remarks;
        if (break_minutes !== undefined)
            updateData.break_minutes = parseInt(break_minutes);
        // Recalculate total hours if both times available
        const finalIn = updateData.in_time || existing.in_time;
        const finalOut = updateData.out_time || existing.out_time;
        if (finalIn && finalOut) {
            let mins = Math.floor((new Date(finalOut).getTime() - new Date(finalIn).getTime()) / 60000);
            const breakMins = (_a = updateData.break_minutes) !== null && _a !== void 0 ? _a : existing.break_minutes;
            if (breakMins)
                mins -= breakMins;
            updateData.total_working_hours = parseFloat((mins / 60).toFixed(2));
        }
        const record = await prismaClient_1.default.attendanceRecord.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        await (0, activityLogger_1.logActivity)(adminUser.id, 'UPDATED', 'ATTENDANCE_RECORD', `Updated record #${id}`);
        res.json({ message: 'Attendance updated successfully', record });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update attendance', details: error.message });
    }
});
/**
 * Delete Attendance Record (Admin)
 */
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const adminUser = req.user;
        if (adminUser.role !== 'Admin' && adminUser.role !== 'Super Admin') {
            return res.status(403).json({ error: 'Only admins can delete attendance' });
        }
        const { id } = req.params;
        const existing = await prismaClient_1.default.attendanceRecord.findUnique({
            where: { id: parseInt(id) },
            include: { user: { select: { name: true } } }
        });
        if (!existing)
            return res.status(404).json({ error: 'Record not found' });
        await prismaClient_1.default.attendanceRecord.delete({ where: { id: parseInt(id) } });
        await (0, activityLogger_1.logActivity)(adminUser.id, 'DELETED', 'ATTENDANCE_RECORD', `Deleted record for ${existing.user.name} on ${existing.date}`);
        res.json({ message: 'Attendance record deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete attendance', details: error.message });
    }
});
/**
 * Bulk Attendance (Admin)
 */
router.post('/bulk', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const adminUser = req.user;
        if (adminUser.role !== 'Admin' && adminUser.role !== 'Super Admin') {
            return res.status(403).json({ error: 'Only admins can add bulk attendance' });
        }
        const { date, entries } = req.body;
        if (!date || !entries || !Array.isArray(entries)) {
            return res.status(400).json({ error: 'date and entries[] are required' });
        }
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        let created = 0;
        let skipped = 0;
        const errors = [];
        for (const entry of entries) {
            try {
                const existing = await prismaClient_1.default.attendanceRecord.findUnique({
                    where: { user_id_date: { user_id: entry.user_id, date: dateObj } }
                });
                if (existing) {
                    skipped++;
                    continue;
                }
                await prismaClient_1.default.attendanceRecord.create({
                    data: {
                        user_id: entry.user_id,
                        date: dateObj,
                        status: entry.status || 'Present',
                        source: 'Bulk',
                        remarks: entry.remarks || 'Bulk entry'
                    }
                });
                created++;
            }
            catch (e) {
                errors.push(`User ${entry.user_id}: ${e.message}`);
            }
        }
        await (0, activityLogger_1.logActivity)(adminUser.id, 'CREATED', 'ATTENDANCE_BULK', `Bulk attendance: ${created} created, ${skipped} skipped`);
        res.json({ message: `Bulk attendance processed`, created, skipped, errors });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process bulk attendance', details: error.message });
    }
});
/**
 * Recalculate Attendance for a Date Range
 */
router.post('/recalculate', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const adminUser = req.user;
        if (adminUser.role !== 'Admin' && adminUser.role !== 'Super Admin') {
            return res.status(403).json({ error: 'Only admins can recalculate attendance' });
        }
        const { start_date, end_date, user_id } = req.body;
        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'start_date and end_date are required' });
        }
        const whereClause = {
            date: {
                gte: new Date(start_date),
                lte: new Date(end_date)
            }
        };
        if (user_id)
            whereClause.user_id = parseInt(user_id);
        const records = await prismaClient_1.default.attendanceRecord.findMany({
            where: whereClause,
            include: { user: { include: { shift: true } } }
        });
        let recalculated = 0;
        for (const record of records) {
            if (!record.in_time)
                continue;
            const updates = {};
            const shift = record.user.shift;
            // Recalculate late
            if (shift) {
                updates.late_by_minutes = calculateLateMinutes(record.in_time, shift.start_time, shift.grace_time_minutes);
            }
            // Recalculate total hours
            if (record.in_time && record.out_time) {
                let netMins = Math.floor((record.out_time.getTime() - record.in_time.getTime()) / 60000);
                if (shift && netMins > shift.break_duration_mins * 2) {
                    netMins -= shift.break_duration_mins;
                    updates.break_minutes = shift.break_duration_mins;
                }
                updates.total_working_hours = parseFloat((netMins / 60).toFixed(2));
                if (shift) {
                    if (updates.total_working_hours > shift.full_day_min_hours) {
                        updates.overtime_hours = parseFloat((updates.total_working_hours - shift.full_day_min_hours).toFixed(2));
                    }
                    else if (updates.total_working_hours < shift.half_day_min_hours) {
                        updates.status = 'Half Day';
                    }
                }
            }
            if (updates.late_by_minutes > 0 && !updates.status) {
                updates.status = 'Late';
            }
            if (Object.keys(updates).length > 0) {
                await prismaClient_1.default.attendanceRecord.update({ where: { id: record.id }, data: updates });
                recalculated++;
            }
        }
        await (0, activityLogger_1.logActivity)(adminUser.id, 'UPDATED', 'ATTENDANCE_RECALCULATE', `Recalculated ${recalculated} records`);
        res.json({ message: `Recalculated ${recalculated} of ${records.length} records` });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to recalculate', details: error.message });
    }
});
/**
 * Get Employees list (for dropdowns in attendance pages)
 */
router.get('/employees', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const employees = await prismaClient_1.default.user.findMany({
            select: {
                id: true, name: true, email: true,
                department: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                shift: { select: { id: true, name: true, start_time: true, end_time: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees', details: error.message });
    }
});
/**
 * Payroll Verification Summary
 * Returns counts of conflicts (pending, rejected, missing punch) for a specific month/year
 */
router.get('/payroll-verification', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { month, year, branch_id, department_id } = req.query;
        const m = parseInt(month) || (new Date().getMonth() + 1);
        const y = parseInt(year) || new Date().getFullYear();
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0);
        const userFilter = {};
        if (branch_id)
            userFilter.branch_id = parseInt(branch_id);
        if (department_id)
            userFilter.department_id = parseInt(department_id);
        const [pending, rejected, missingPunch, onHold] = await Promise.all([
            prismaClient_1.default.attendanceRequest.count({
                where: {
                    status: 'Pending',
                    date: { gte: startDate, lte: endDate },
                    user: userFilter || {}
                }
            }),
            prismaClient_1.default.attendanceRequest.count({
                where: {
                    status: 'Rejected',
                    date: { gte: startDate, lte: endDate },
                    user: userFilter || {}
                }
            }),
            prismaClient_1.default.attendanceRecord.count({
                where: {
                    status: 'MissingPunch',
                    date: { gte: startDate, lte: endDate },
                    user: userFilter || {}
                }
            }),
            prismaClient_1.default.salaryHoldRequest.count({
                where: {
                    status: 'Approved',
                    month: m,
                    year: y,
                    employee: userFilter || {}
                }
            })
        ]);
        res.json({ pending, rejected, missingPunch, onHold });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch verification stats', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=attendance.js.map