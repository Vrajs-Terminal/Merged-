"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// GET /api/tracking/dashboard — KPIs and summary stats
router.get('/dashboard', authMiddleware_1.authenticateToken, async (_req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        const totalEmployees = await prismaClient_1.default.user.count();
        // Employees with tracking enabled
        const trackingEnabled = await prismaClient_1.default.trackingConfig.count({ where: { enabled: true } });
        // Today's logs
        const todayLogs = await prismaClient_1.default.trackingLog.findMany({
            where: { timestamp: { gte: todayStart, lt: todayEnd } },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { timestamp: 'desc' }
        });
        // Get unique users who logged today with their latest status
        const latestByUser = new Map();
        for (const log of todayLogs) {
            if (!latestByUser.has(log.user_id)) {
                latestByUser.set(log.user_id, log);
            }
        }
        const activeEmployees = latestByUser.size;
        const workingCount = [...latestByUser.values()].filter(l => l.status === 'Working').length;
        const fieldVisitCount = [...latestByUser.values()].filter(l => l.status === 'Field Visit').length;
        const breakCount = [...latestByUser.values()].filter(l => l.status === 'Break').length;
        const offlineCount = [...latestByUser.values()].filter(l => l.status === 'Offline').length;
        // Exceptions today
        const todayExceptions = await prismaClient_1.default.trackingException.count({
            where: { createdAt: { gte: todayStart, lt: todayEnd } }
        });
        // Geofence violations today
        const geofenceViolations = await prismaClient_1.default.trackingException.count({
            where: {
                type: 'Geofence Violation',
                createdAt: { gte: todayStart, lt: todayEnd }
            }
        });
        // Recent check-ins (first log of each user today)
        const checkIns = await prismaClient_1.default.trackingLog.findMany({
            where: { timestamp: { gte: todayStart, lt: todayEnd } },
            orderBy: { timestamp: 'asc' },
            include: {
                user: {
                    select: {
                        id: true, name: true,
                        department: { select: { name: true } },
                        branch: { select: { name: true } }
                    }
                }
            },
            take: 100
        });
        // Unique first check-in per user
        const firstCheckIns = new Map();
        for (const ci of checkIns) {
            if (!firstCheckIns.has(ci.user_id)) {
                firstCheckIns.set(ci.user_id, ci);
            }
        }
        // Late check-ins (after 9:30 AM)
        const lateThreshold = new Date(todayStart);
        lateThreshold.setHours(9, 30, 0, 0);
        const lateCheckIns = [...firstCheckIns.values()].filter(ci => ci.timestamp > lateThreshold);
        // Field employees (latest status is Field Visit)
        const fieldEmployees = [...latestByUser.values()]
            .filter(l => l.status === 'Field Visit')
            .map(l => {
            var _a;
            return ({
                id: l.user_id,
                name: (_a = l.user) === null || _a === void 0 ? void 0 : _a.name,
                location: l.location,
                lastUpdate: l.timestamp,
                batteryLevel: l.batteryLevel
            });
        });
        res.json({
            totalEmployees,
            trackingEnabled,
            activeEmployees,
            workingCount,
            fieldVisitCount,
            breakCount,
            offlineCount,
            todayExceptions,
            geofenceViolations,
            recentCheckIns: [...firstCheckIns.values()].slice(0, 10).map(ci => {
                var _a, _b, _c;
                return ({
                    id: ci.user_id,
                    name: (_a = ci.user) === null || _a === void 0 ? void 0 : _a.name,
                    department: (_c = (_b = ci.user) === null || _b === void 0 ? void 0 : _b.department) === null || _c === void 0 ? void 0 : _c.name,
                    time: ci.timestamp,
                    location: ci.location,
                    isLate: ci.timestamp > lateThreshold
                });
            }),
            lateCheckIns: lateCheckIns.length,
            fieldEmployees
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard', details: error.message });
    }
});
// GET /api/tracking/live — live employee positions
router.get('/live', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { department, status, search } = req.query;
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Get all users with latest tracking log
        const userWhere = {};
        if (department && department !== 'All Departments') {
            userWhere.department = { name: department };
        }
        if (search) {
            userWhere.name = { contains: search };
        }
        const users = await prismaClient_1.default.user.findMany({
            where: userWhere,
            select: {
                id: true, name: true,
                department: { select: { name: true } },
                branch: { select: { name: true } },
                trackingConfig: true,
                trackingLogs: {
                    where: { timestamp: { gte: todayStart } },
                    orderBy: { timestamp: 'desc' },
                    take: 1
                }
            }
        });
        let employees = users.map(u => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return ({
                id: u.id,
                name: u.name,
                department: ((_a = u.department) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                branch: ((_b = u.branch) === null || _b === void 0 ? void 0 : _b.name) || 'N/A',
                trackingEnabled: (_d = (_c = u.trackingConfig) === null || _c === void 0 ? void 0 : _c.enabled) !== null && _d !== void 0 ? _d : false,
                status: ((_e = u.trackingLogs[0]) === null || _e === void 0 ? void 0 : _e.status) || 'Offline',
                lastLocation: ((_f = u.trackingLogs[0]) === null || _f === void 0 ? void 0 : _f.location) || 'No data',
                lastUpdate: ((_g = u.trackingLogs[0]) === null || _g === void 0 ? void 0 : _g.timestamp) || null,
                batteryLevel: ((_h = u.trackingLogs[0]) === null || _h === void 0 ? void 0 : _h.batteryLevel) || null,
                latitude: ((_j = u.trackingLogs[0]) === null || _j === void 0 ? void 0 : _j.latitude) || null,
                longitude: ((_k = u.trackingLogs[0]) === null || _k === void 0 ? void 0 : _k.longitude) || null
            });
        });
        // Filter by status
        if (status && status !== 'All Status') {
            employees = employees.filter(e => e.status === status);
        }
        // Status counts
        const statusCounts = {
            Working: employees.filter(e => e.status === 'Working').length,
            'Field Visit': employees.filter(e => e.status === 'Field Visit').length,
            Break: employees.filter(e => e.status === 'Break').length,
            Offline: employees.filter(e => e.status === 'Offline').length
        };
        res.json({ employees, statusCounts, total: employees.length });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch live tracking', details: error.message });
    }
});
// GET /api/tracking/history — employee travel history
router.get('/history', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { user_id, department, start_date, end_date } = req.query;
        const whereClause = {};
        if (user_id)
            whereClause.user_id = parseInt(user_id);
        if (start_date && end_date) {
            whereClause.timestamp = {
                gte: new Date(start_date),
                lte: new Date(end_date + 'T23:59:59')
            };
        }
        else if (start_date) {
            whereClause.timestamp = { gte: new Date(start_date) };
        }
        // Dept filter via user relation
        let userFilter = undefined;
        if (department && department !== 'All Departments') {
            userFilter = { department: { name: department } };
            whereClause.user = userFilter;
        }
        const logs = await prismaClient_1.default.trackingLog.findMany({
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
            orderBy: { timestamp: 'desc' },
            take: 500
        });
        // Summary stats
        const uniqueUsers = new Set(logs.map(l => l.user_id));
        const totalDistance = (uniqueUsers.size * 12.5).toFixed(1); // Simulated km
        res.json({
            logs,
            summary: {
                totalRecords: logs.length,
                uniqueEmployees: uniqueUsers.size,
                totalDistance: `${totalDistance} km`,
                avgPerEmployee: uniqueUsers.size > 0 ? `${(parseFloat(totalDistance) / uniqueUsers.size).toFixed(1)} km` : '0 km'
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tracking history', details: error.message });
    }
});
// GET /api/tracking/history/export — CSV export
router.get('/history/export', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const whereClause = {};
        if (start_date && end_date) {
            whereClause.timestamp = {
                gte: new Date(start_date),
                lte: new Date(end_date + 'T23:59:59')
            };
        }
        const logs = await prismaClient_1.default.trackingLog.findMany({
            where: whereClause,
            include: { user: { select: { name: true, department: { select: { name: true } } } } },
            orderBy: { timestamp: 'desc' }
        });
        const header = 'ID,Employee,Department,Latitude,Longitude,Location,Status,Battery,Timestamp\n';
        const rows = logs.map(l => { var _a; return `${l.id},"${l.user.name}","${((_a = l.user.department) === null || _a === void 0 ? void 0 : _a.name) || ''}",${l.latitude},${l.longitude},"${l.location || ''}",${l.status},${l.batteryLevel || ''},${l.timestamp.toISOString()}`; }).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tracking_history.csv');
        res.send(header + rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export history', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=tracking.js.map