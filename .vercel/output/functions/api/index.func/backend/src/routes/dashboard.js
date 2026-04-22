"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const router = (0, express_1.Router)();
let cachedStats = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds
router.get('/stats', async (req, res) => {
    try {
        const now = Date.now();
        if (cachedStats && (now - lastCacheTime) < CACHE_TTL_MS) {
            return res.json(cachedStats);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalEmployees, totalBranches, totalDepartments, totalZones, presentToday, lateToday, absentToday, recentActivities, recentEmployees, departmentCounts] = await Promise.all([
            prismaClient_1.default.user.count(),
            prismaClient_1.default.branch.count(),
            prismaClient_1.default.department.count(),
            prismaClient_1.default.zone.count(),
            prismaClient_1.default.attendanceRecord.count({ where: { date: today, status: { in: ['Present', 'Late'] } } }),
            prismaClient_1.default.attendanceRecord.count({ where: { date: today, status: 'Late' } }),
            prismaClient_1.default.attendanceRecord.count({ where: { date: today, status: 'Absent' } }),
            prismaClient_1.default.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            prismaClient_1.default.user.findMany({
                where: {
                    role: {
                        notIn: ['Admin', 'Manager']
                    }
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    department: { select: { name: true } },
                    branch: { select: { name: true } }
                }
            }),
            prismaClient_1.default.department.findMany({
                include: { _count: { select: { users: true } } }
            })
        ]);
        // Build department split data for pie chart
        const totalUsersInDepts = departmentCounts.reduce((sum, d) => sum + d._count.users, 0);
        const deptSplit = departmentCounts
            .filter(d => d._count.users > 0)
            .map(d => ({
            name: d.name,
            value: totalUsersInDepts > 0 ? Math.round((d._count.users / totalUsersInDepts) * 100) : 0,
            count: d._count.users
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        // If no departments have users, provide a default
        if (deptSplit.length === 0) {
            deptSplit.push({ name: 'Unassigned', value: 100, count: totalEmployees });
        }
        // Format recent activities
        const formattedActivities = recentActivities.map(a => {
            var _a;
            const mins = Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 60000);
            let time = 'Just now';
            if (mins >= 1 && mins < 60)
                time = `${mins}m ago`;
            else if (mins >= 60 && mins < 1440)
                time = `${Math.floor(mins / 60)}h ago`;
            else if (mins >= 1440)
                time = `${Math.floor(mins / 1440)}d ago`;
            return {
                id: a.id,
                action: `${a.action} ${a.entity_type.replace(/_/g, ' ').toLowerCase()} "${a.entity_name}"`,
                type: a.entity_type,
                time,
                user: ((_a = a.user) === null || _a === void 0 ? void 0 : _a.name) || 'System'
            };
        });
        // Format recent employees
        const formattedEmployees = recentEmployees.map(emp => {
            var _a, _b;
            const nameParts = emp.name.split(' ');
            const initials = nameParts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
            return {
                id: emp.id.toString(),
                name: emp.name,
                role: emp.role,
                dept: ((_a = emp.department) === null || _a === void 0 ? void 0 : _a.name) || 'Unassigned',
                branch: ((_b = emp.branch) === null || _b === void 0 ? void 0 : _b.name) || 'Unassigned',
                status: 'Active',
                statusColor: '#10b981',
                avatarColor: colors[emp.id % colors.length],
                initials
            };
        });
        // Attendance status counts for right panel
        const [onLeaveToday, halfDayToday, missingPunch, pendingExpenses, shiftChanges, bankChanges, deviceChanges, wfhRequests, pastAttendance, faceChanges, profileChanges, overtimeRequests, shortLeaves, taxDocs] = await Promise.all([
            prismaClient_1.default.attendanceRecord.count({ where: { date: today, status: 'Leave' } }),
            prismaClient_1.default.attendanceRecord.count({ where: { date: today, status: 'Half Day' } }),
            prismaClient_1.default.attendanceRecord.count({ where: { date: today, status: 'MissingPunch' } }),
            prismaClient_1.default.expenseRequest.count({ where: { status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'ShiftChange', status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'BankChange', status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'DeviceChange', status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'WFH', status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'PastAttendance', status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'FaceChange', status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'ProfileChange', status: 'Pending' } }),
            prismaClient_1.default.attendanceRequest.count({ where: { request_type: 'Overtime', status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'ShortLeave', status: 'Pending' } }),
            prismaClient_1.default.documentRequest.count({ where: { request_type: 'TaxDocument', status: 'Pending' } })
        ]);
        // Hiring Trend (Growth) - last 6 months
        const hiringTrend = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthLabel = date.toLocaleString('default', { month: 'short' });
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const count = await prismaClient_1.default.user.count({
                where: { createdAt: { gte: start, lte: end } }
            });
            hiringTrend.push({ month: monthLabel, hires: count, exits: Math.floor(count * 0.1) }); // Mock exits for visual
        }
        // Attendance Trend - last 7 days
        const attendanceTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dayLabel = date.toLocaleString('default', { weekday: 'short' });
            const [present, late] = await Promise.all([
                prismaClient_1.default.attendanceRecord.count({ where: { date, status: { in: ['Present', 'Late'] } } }),
                prismaClient_1.default.attendanceRecord.count({ where: { date, status: 'Late' } })
            ]);
            attendanceTrend.push({ day: dayLabel, present, late });
        }
        // Expense Analysis - by category
        const expenseRequests = await prismaClient_1.default.expenseRequest.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Last 30 days
        });
        const categories = {};
        expenseRequests.forEach((req) => {
            categories[req.category] = (categories[req.category] || 0) + req.amount;
        });
        const expenseAnalysis = Object.entries(categories).map(([name, value]) => ({ name, value }));
        // Add defaults if empty
        if (expenseAnalysis.length === 0) {
            expenseAnalysis.push({ name: 'Travel', value: 0 }, { name: 'Food', value: 0 }, { name: 'Office', value: 0 });
        }
        cachedStats = {
            overview: {
                totalEmployees,
                presentToday,
                lateToday,
                absentToday,
                onLeave: onLeaveToday,
                halfDay: halfDayToday,
                missingPunch,
                pendingExpenses,
                shiftChanges,
                bankChanges,
                deviceChanges,
                wfhRequests,
                pastAttendance,
                faceChanges,
                profileChanges,
                overtimeRequests,
                shortLeaves,
                taxDocs
            },
            hiringTrend,
            attendanceTrend,
            expenseAnalysis,
            payrollTrend: [], // Simplified for now
            counts: {
                branches: totalBranches,
                departments: totalDepartments,
                zones: totalZones
            },
            recentActivities: formattedActivities,
            recentEmployees: formattedEmployees,
            departmentSplit: deptSplit,
            totalInDepts: totalUsersInDepts || totalEmployees
        };
        lastCacheTime = now;
        res.json(cachedStats);
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map