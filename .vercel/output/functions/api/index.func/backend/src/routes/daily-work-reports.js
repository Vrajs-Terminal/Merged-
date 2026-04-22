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
// GET all daily work reports with filters
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { date, employeeName, department, status, designation, location, workType } = req.query;
        const whereClause = {};
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            whereClause.work_date = { gte: startDate, lte: endDate };
        }
        if (status && status !== 'All Status')
            whereClause.status = status;
        if (workType && workType !== 'All Types')
            whereClause.work_type = workType;
        if (employeeName || department || designation) {
            whereClause.user = {};
            if (employeeName) {
                whereClause.user.name = { contains: employeeName };
            }
            if (department && department !== 'All Departments') {
                whereClause.user.department = { name: department };
            }
            if (designation && designation !== 'All Designations') {
                whereClause.user.designation = { name: designation };
            }
        }
        if (location) {
            whereClause.activities = {
                some: {
                    location: { contains: location }
                }
            };
        }
        const reports = await prismaClient_1.default.dailyWork.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        department: { select: { name: true } },
                        designation: { select: { name: true } },
                        employeeGrade: { select: { name: true } }
                    }
                }
            },
            orderBy: { work_date: 'desc' },
            take: 200
        });
        // Format for frontend
        const formattedReports = reports.map((r) => {
            var _a;
            return ({
                id: r.id,
                employeeName: r.user.name,
                department: ((_a = r.user.department) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                date: r.work_date.toISOString().split('T')[0],
                checkIn: r.check_in_time ? r.check_in_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                checkOut: r.check_out_time ? r.check_out_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                totalHours: `${r.total_work_hours.toFixed(1)}h`,
                distance: `${r.total_distance.toFixed(1)} km`,
                tasksCompleted: r.tasks_completed,
                status: r.status
            });
        });
        res.json(formattedReports);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily work reports', details: error.message });
    }
});
// GET detailed report by ID
router.get('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const id = parseInt(req.params.id);
        const report = await prismaClient_1.default.dailyWork.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        department: { select: { name: true } },
                        designation: { select: { name: true } },
                        employeeGrade: { select: { name: true } }
                    }
                },
                activities: {
                    orderBy: { activity_time: 'asc' }
                }
            }
        });
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        // Format detailed view
        const detailedReport = {
            summary: {
                id: report.id,
                employeeName: report.user.name,
                date: report.work_date.toISOString().split('T')[0],
                totalWorkTime: `${report.total_work_hours.toFixed(1)}h`,
                distanceCovered: `${report.total_distance.toFixed(1)} km`,
                locationsVisited: new Set(report.activities.map((a) => a.location).filter(Boolean)).size,
                tasksCompleted: report.tasks_completed,
                breakTime: `${report.break_time_mins} mins`,
                workType: report.work_type,
                designation: ((_a = report.user.designation) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                status: report.status,
                adminRemark: report.admin_remark
            },
            activities: report.activities.map((a) => ({
                id: a.id,
                time: a.activity_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                activity: a.activity_type,
                location: a.location || 'Unknown',
                notes: a.notes || '',
                lat: a.latitude,
                lng: a.longitude
            }))
        };
        res.json(detailedReport);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch detailed report', details: error.message });
    }
});
// PATCH update report status
router.patch('/:id/status', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, remark } = req.body;
        const updatedReport = await prismaClient_1.default.dailyWork.update({
            where: { id },
            data: {
                status,
                admin_remark: remark
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'DAILY_WORK_REPORT', `Updated report ${id} status to ${status}`);
        res.json(updatedReport);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update report status', details: error.message });
    }
});
// GET export reports
router.get('/export', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { date, department, designation, status, workType } = req.query;
        const whereClause = {};
        if (date)
            whereClause.work_date = new Date(date);
        if (status && status !== 'All Status')
            whereClause.status = status;
        if (workType && workType !== 'All Types')
            whereClause.work_type = status;
        if (department || designation) {
            whereClause.user = {};
            if (department && department !== 'All Departments') {
                whereClause.user.department = { name: department };
            }
            if (designation && designation !== 'All Designations') {
                whereClause.user.designation = { name: designation };
            }
        }
        const reports = await prismaClient_1.default.dailyWork.findMany({
            where: whereClause,
            include: { user: { select: { name: true, department: { select: { name: true } } } } }
        });
        let csv = 'Employee,Date,Check In,Check Out,Total Hours,Distance,Tasks,Status\n';
        reports.forEach((r) => {
            var _a, _b;
            csv += `"${r.user.name}","${r.work_date.toISOString().split('T')[0]}","${((_a = r.check_in_time) === null || _a === void 0 ? void 0 : _a.toLocaleTimeString()) || '--'}","${((_b = r.check_out_time) === null || _b === void 0 ? void 0 : _b.toLocaleTimeString()) || '--'}","${r.total_work_hours}h","${r.total_distance}km","${r.tasks_completed}","${r.status}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=daily-work-reports.csv');
        res.status(200).send(csv);
    }
    catch (error) {
        res.status(500).json({ error: 'Export failed' });
    }
});
exports.default = router;
//# sourceMappingURL=daily-work-reports.js.map