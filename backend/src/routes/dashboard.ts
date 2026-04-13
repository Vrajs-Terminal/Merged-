import { Router } from 'express';
import prisma from '../lib/prismaClient';

const router = Router();

let cachedStats: any = null;
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

        const [
            totalEmployees,
            totalBranches,
            totalDepartments,
            totalZones,
            presentToday,
            lateToday,
            absentToday,
            recentActivities,
            recentEmployees,
            departmentCounts
        ] = await Promise.all([
            prisma.user.count(),
            prisma.branch.count(),
            prisma.department.count(),
            prisma.zone.count(),
            prisma.attendanceRecord.count({ where: { date: today, status: { in: ['Present', 'Late'] } } }),
            prisma.attendanceRecord.count({ where: { date: today, status: 'Late' } }),
            prisma.attendanceRecord.count({ where: { date: today, status: 'Absent' } }),
            prisma.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            prisma.user.findMany({
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
            prisma.department.findMany({
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
            const mins = Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 60000);
            let time = 'Just now';
            if (mins >= 1 && mins < 60) time = `${mins}m ago`;
            else if (mins >= 60 && mins < 1440) time = `${Math.floor(mins / 60)}h ago`;
            else if (mins >= 1440) time = `${Math.floor(mins / 1440)}d ago`;

            return {
                id: a.id,
                action: `${a.action} ${a.entity_type.replace(/_/g, ' ').toLowerCase()} "${a.entity_name}"`,
                type: a.entity_type,
                time,
                user: a.user?.name || 'System'
            };
        });

        // Format recent employees
        const formattedEmployees = recentEmployees.map(emp => {
            const nameParts = emp.name.split(' ');
            const initials = nameParts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
            return {
                id: emp.id.toString(),
                name: emp.name,
                role: emp.role,
                dept: emp.department?.name || 'Unassigned',
                branch: emp.branch?.name || 'Unassigned',
                status: 'Active',
                statusColor: '#10b981',
                avatarColor: colors[emp.id % colors.length],
                initials
            };
        });

        // Attendance status counts for right panel
        const [
            onLeaveToday,
            halfDayToday,
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
        ] = await Promise.all([
            (prisma as any).attendanceRecord.count({ where: { date: today, status: 'Leave' } }),
            (prisma as any).attendanceRecord.count({ where: { date: today, status: 'Half Day' } }),
            (prisma as any).attendanceRecord.count({ where: { date: today, status: 'MissingPunch' } }),
            (prisma as any).expenseRequest.count({ where: { status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'ShiftChange', status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'BankChange', status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'DeviceChange', status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'WFH', status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'PastAttendance', status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'FaceChange', status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'ProfileChange', status: 'Pending' } }),
            (prisma as any).attendanceRequest.count({ where: { request_type: 'Overtime', status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'ShortLeave', status: 'Pending' } }),
            (prisma as any).documentRequest.count({ where: { request_type: 'TaxDocument', status: 'Pending' } })
        ]);

        // Hiring Trend (Growth) - last 6 months
        const hiringTrend = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthLabel = date.toLocaleString('default', { month: 'short' });
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const count = await prisma.user.count({
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
                prisma.attendanceRecord.count({ where: { date, status: { in: ['Present', 'Late'] } } }),
                prisma.attendanceRecord.count({ where: { date, status: 'Late' } })
            ]);
            attendanceTrend.push({ day: dayLabel, present, late });
        }

        // Expense Analysis - by category
        const expenseRequests = await (prisma as any).expenseRequest.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Last 30 days
        });
        const categories: Record<string, number> = {};
        expenseRequests.forEach((req: any) => {
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
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;
