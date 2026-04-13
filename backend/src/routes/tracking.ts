import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// GET /api/tracking/dashboard — KPIs and summary stats
router.get('/dashboard', authenticateToken, async (_req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const totalEmployees = await prisma.user.count();

        // Employees with tracking enabled
        const trackingEnabled = await prisma.trackingConfig.count({ where: { enabled: true } });

        // Today's logs
        const todayLogs = await prisma.trackingLog.findMany({
            where: { timestamp: { gte: todayStart, lt: todayEnd } },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { timestamp: 'desc' }
        });

        // Get unique users who logged today with their latest status
        const latestByUser = new Map<number, any>();
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
        const todayExceptions = await prisma.trackingException.count({
            where: { createdAt: { gte: todayStart, lt: todayEnd } }
        });

        // Geofence violations today
        const geofenceViolations = await prisma.trackingException.count({
            where: {
                type: 'Geofence Violation',
                createdAt: { gte: todayStart, lt: todayEnd }
            }
        });

        // Recent check-ins (first log of each user today)
        const checkIns = await prisma.trackingLog.findMany({
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
        const firstCheckIns = new Map<number, any>();
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
            .map(l => ({
                id: l.user_id,
                name: l.user?.name,
                location: l.location,
                lastUpdate: l.timestamp,
                batteryLevel: l.batteryLevel
            }));

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
            recentCheckIns: [...firstCheckIns.values()].slice(0, 10).map(ci => ({
                id: ci.user_id,
                name: ci.user?.name,
                department: ci.user?.department?.name,
                time: ci.timestamp,
                location: ci.location,
                isLate: ci.timestamp > lateThreshold
            })),
            lateCheckIns: lateCheckIns.length,
            fieldEmployees
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch dashboard', details: error.message });
    }
});

// GET /api/tracking/live — live employee positions
router.get('/live', authenticateToken, async (req, res) => {
    try {
        const { department, status, search } = req.query;
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Get all users with latest tracking log
        const userWhere: any = {};
        if (department && department !== 'All Departments') {
            userWhere.department = { name: department as string };
        }
        if (search) {
            userWhere.name = { contains: search as string };
        }

        const users = await prisma.user.findMany({
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

        let employees = users.map(u => ({
            id: u.id,
            name: u.name,
            department: u.department?.name || 'N/A',
            branch: u.branch?.name || 'N/A',
            trackingEnabled: u.trackingConfig?.enabled ?? false,
            status: u.trackingLogs[0]?.status || 'Offline',
            lastLocation: u.trackingLogs[0]?.location || 'No data',
            lastUpdate: u.trackingLogs[0]?.timestamp || null,
            batteryLevel: u.trackingLogs[0]?.batteryLevel || null,
            latitude: u.trackingLogs[0]?.latitude || null,
            longitude: u.trackingLogs[0]?.longitude || null
        }));

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
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch live tracking', details: error.message });
    }
});

// GET /api/tracking/history — employee travel history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const { user_id, department, start_date, end_date } = req.query;

        const whereClause: any = {};
        if (user_id) whereClause.user_id = parseInt(user_id as string);
        if (start_date && end_date) {
            whereClause.timestamp = {
                gte: new Date(start_date as string),
                lte: new Date(end_date as string + 'T23:59:59')
            };
        } else if (start_date) {
            whereClause.timestamp = { gte: new Date(start_date as string) };
        }

        // Dept filter via user relation
        let userFilter: any = undefined;
        if (department && department !== 'All Departments') {
            userFilter = { department: { name: department as string } };
            whereClause.user = userFilter;
        }

        const logs = await prisma.trackingLog.findMany({
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
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch tracking history', details: error.message });
    }
});

// GET /api/tracking/history/export — CSV export
router.get('/history/export', authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const whereClause: any = {};
        if (start_date && end_date) {
            whereClause.timestamp = {
                gte: new Date(start_date as string),
                lte: new Date(end_date as string + 'T23:59:59')
            };
        }

        const logs = await prisma.trackingLog.findMany({
            where: whereClause,
            include: { user: { select: { name: true, department: { select: { name: true } } } } },
            orderBy: { timestamp: 'desc' }
        });

        const header = 'ID,Employee,Department,Latitude,Longitude,Location,Status,Battery,Timestamp\n';
        const rows = logs.map(l =>
            `${l.id},"${l.user.name}","${l.user.department?.name || ''}",${l.latitude},${l.longitude},"${l.location || ''}",${l.status},${l.batteryLevel || ''},${l.timestamp.toISOString()}`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tracking_history.csv');
        res.send(header + rows);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to export history', details: error.message });
    }
});

export default router;
