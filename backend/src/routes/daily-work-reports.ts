import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// GET all daily work reports with filters
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { date, employeeName, department, status, designation, location, workType } = req.query;
        const whereClause: any = {};

        if (date) {
            const startDate = new Date(date as string);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date as string);
            endDate.setHours(23, 59, 59, 999);
            whereClause.work_date = { gte: startDate, lte: endDate };
        }
        if (status && status !== 'All Status') whereClause.status = status as string;
        if (workType && workType !== 'All Types') whereClause.work_type = workType as string;

        if (employeeName || department || designation) {
            whereClause.user = {};
            if (employeeName) {
                whereClause.user.name = { contains: employeeName as string };
            }
            if (department && department !== 'All Departments') {
                whereClause.user.department = { name: department as string };
            }
            if (designation && designation !== 'All Designations') {
                whereClause.user.designation = { name: designation as string };
            }
        }

        if (location) {
            whereClause.activities = {
                some: {
                    location: { contains: location as string }
                }
            };
        }

        const reports = await (prisma as any).dailyWork.findMany({
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
        const formattedReports = reports.map((r: any) => ({
            id: r.id,
            employeeName: r.user.name,
            department: r.user.department?.name || 'N/A',
            date: r.work_date.toISOString().split('T')[0],
            checkIn: r.check_in_time ? r.check_in_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
            checkOut: r.check_out_time ? r.check_out_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
            totalHours: `${r.total_work_hours.toFixed(1)}h`,
            distance: `${r.total_distance.toFixed(1)} km`,
            tasksCompleted: r.tasks_completed,
            status: r.status
        }));

        res.json(formattedReports);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch daily work reports', details: error.message });
    }
});

// GET detailed report by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id as string);
        const report = await (prisma as any).dailyWork.findUnique({
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
                locationsVisited: new Set(report.activities.map((a: any) => a.location).filter(Boolean)).size,
                tasksCompleted: report.tasks_completed,
                breakTime: `${report.break_time_mins} mins`,
                workType: report.work_type,
                designation: report.user.designation?.name || 'N/A',
                status: report.status,
                adminRemark: report.admin_remark
            },
            activities: report.activities.map((a: any) => ({
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
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch detailed report', details: error.message });
    }
});

// PATCH update report status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status, remark } = req.body;

        const updatedReport = await (prisma as any).dailyWork.update({
            where: { id },
            data: {
                status,
                admin_remark: remark
            }
        });

        await logActivity(null, 'UPDATED', 'DAILY_WORK_REPORT', `Updated report ${id} status to ${status}`);
        res.json(updatedReport);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update report status', details: error.message });
    }
});

// GET export reports
router.get('/export', authenticateToken, async (req, res) => {
    try {
        const { date, department, designation, status, workType } = req.query;
        const whereClause: any = {};
        if (date) whereClause.work_date = new Date(date as string);
        if (status && status !== 'All Status') whereClause.status = status as string;
        if (workType && workType !== 'All Types') whereClause.work_type = status as string;

        if (department || designation) {
            whereClause.user = {};
            if (department && department !== 'All Departments') {
                whereClause.user.department = { name: department as string };
            }
            if (designation && designation !== 'All Designations') {
                whereClause.user.designation = { name: designation as string };
            }
        }

        const reports = await (prisma as any).dailyWork.findMany({
            where: whereClause,
            include: { user: { select: { name: true, department: { select: { name: true } } } } }
        });

        let csv = 'Employee,Date,Check In,Check Out,Total Hours,Distance,Tasks,Status\n';
        reports.forEach((r: any) => {
            csv += `"${r.user.name}","${r.work_date.toISOString().split('T')[0]}","${r.check_in_time?.toLocaleTimeString() || '--'}","${r.check_out_time?.toLocaleTimeString() || '--'}","${r.total_work_hours}h","${r.total_distance}km","${r.tasks_completed}","${r.status}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=daily-work-reports.csv');
        res.status(200).send(csv);
    } catch (error: any) {
        res.status(500).json({ error: 'Export failed' });
    }
});

export default router;
