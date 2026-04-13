import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0] || "";
        const todayDate = new Date(todayStr);

        // Basic Statistics & Pending Counts
        const [
            totalEmployees,
            activeEmployees,
            pendingLeaves,
            upcomingEvents,
            openLostFound,
            totalAssets,
            presentToday,
            numBranches,
            numDepts,
            pendingExpenses,
            overtimeRequests,
            deviceChanges
        ] = await Promise.all([
            prisma.employee.count(),
            prisma.employee.count({ where: { status: "Active" } }),
            prisma.leaveRequest.count({ where: { status: "Pending" } }),
            prisma.event.count({ where: { startDate: { gte: new Date() } } }),
            prisma.lostFoundItem.count({ where: { status: "Open" } }),
            prisma.asset.count(),
            prisma.attendanceLog.count({
                where: {
                    date: todayDate,
                    clockIn: { not: null },
                },
            }),
            prisma.branch.count(),
            prisma.department.count(),
            prisma.expenseRequest.count({ where: { status: "Pending" } }),
            prisma.attendanceRequest.count({ where: { request_type: "Overtime", status: "Pending" } }),
            prisma.deviceChangeRequest.count({ where: { status: "Pending" } })
        ]);

        // Department Split
        const deptStats = await prisma.employee.groupBy({
            by: ['department'],
            _count: { id: true },
            where: { department: { not: null } }
        });

        const deptData = deptStats.map(d => ({
            name: d.department || 'Unknown',
            value: Math.round((d._count.id / (totalEmployees || 1)) * 100)
        }));

        // Recent Employees
        const recentEmployees = await prisma.employee.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                status: true,
                createdAt: true
            }
        });

        // Recent Activities
        const recentActivitiesRaw = await prisma.activityLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        });

        const recentActivities = recentActivitiesRaw.map(a => ({
            id: a.id,
            action: `${a.action} ${a.entity_type}`,
            user: a.user?.name || 'System',
            time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        res.status(200).json({
            overview: {
                totalEmployees,
                activeEmployees,
                presentToday,
                onLeave: pendingLeaves, 
                absentToday: totalEmployees - presentToday,
                pendingExpenses,
                wfhRequests: 0,
                overtimeRequests,
                deviceChanges,
                profileChanges: 0,
                bankChanges: 0,
                faceChanges: 0,
                shiftChanges: 0,
                taxDocs: 0,
                lateToday: 0, 
                missingPunch: 0,
                halfDay: 0,
                pastAttendance: 0,
                shortLeaves: 0
            },
            counts: {
                branches: numBranches,
                departments: numDepts
            },
            departmentSplit: deptData,
            recentEmployees: recentEmployees.map(e => {
                const fullName = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Worker';
                return {
                    id: e.id,
                    name: fullName,
                    initials: fullName.split(' ').map(n => n[0]).join(''),
                    dept: e.department || 'General',
                    status: e.status || 'Active',
                    statusColor: e.status === 'Active' ? '#10b981' : '#f59e0b',
                    avatarColor: '#3b82f6'
                }
            }),
            recentActivities,
            hiringTrend: [
                { month: 'Jan', hires: 4, exits: 1 },
                { month: 'Feb', hires: 6, exits: 2 },
                { month: 'Mar', hires: 8, exits: 3 },
                { month: 'Apr', hires: totalEmployees, exits: 2 }
            ],
            attendanceTrend: [
                { day: 'Mon', present: 85, late: 5 },
                { day: 'Tue', present: 88, late: 3 },
                { day: 'Wed', present: 82, late: 8 },
                { day: 'Thu', present: 90, late: 2 },
                { day: 'Fri', present: 87, late: 4 }
            ],
            totalAssets,
            upcomingEvents,
            openLostFound
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
