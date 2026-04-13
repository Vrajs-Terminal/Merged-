import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// GET all exceptions with filters
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { type, severity, status } = req.query;
        const whereClause: any = {};
        if (type && type !== 'All') whereClause.type = type as string;
        if (severity && severity !== 'All') whereClause.severity = severity as string;
        if (status && status !== 'All') whereClause.status = status as string;

        const exceptions = await prisma.trackingException.findMany({
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
            orderBy: { createdAt: 'desc' },
            take: 200
        });

        // Stats
        const stats = {
            total: await prisma.trackingException.count({ where: whereClause }),
            pending: await prisma.trackingException.count({ where: { ...whereClause, status: 'Pending' } }),
            approved: await prisma.trackingException.count({ where: { ...whereClause, status: 'Approved' } }),
            rejected: await prisma.trackingException.count({ where: { ...whereClause, status: 'Rejected' } }),
        };

        // Type counts
        const typeCounts = {
            latePunch: await prisma.trackingException.count({ where: { type: 'Late Punch' } }),
            geofenceViolation: await prisma.trackingException.count({ where: { type: 'Geofence Violation' } }),
            gpsOff: await prisma.trackingException.count({ where: { type: 'GPS Off' } }),
            internetOff: await prisma.trackingException.count({ where: { type: 'Internet Off' } }),
            unauthorized: await prisma.trackingException.count({ where: { type: 'Unauthorized Movement' } }),
        };

        res.json({ exceptions, stats, typeCounts });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch exceptions', details: error.message });
    }
});

// PATCH approve exception
router.patch('/:id/approve', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id as string;
        const exception = await prisma.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Approved', resolvedAt: new Date() }
        });
        await logActivity(null, 'UPDATED', 'TRACKING_EXCEPTION', `Approved exception #${id}`);
        res.json(exception);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to approve exception', details: error.message });
    }
});

// PATCH reject exception
router.patch('/:id/reject', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id as string;
        const exception = await prisma.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Rejected', resolvedAt: new Date() }
        });
        await logActivity(null, 'UPDATED', 'TRACKING_EXCEPTION', `Rejected exception #${id}`);
        res.json(exception);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to reject exception', details: error.message });
    }
});

// PATCH ask reason
router.patch('/:id/ask-reason', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id as string;
        const exception = await prisma.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Asked Reason' }
        });
        await logActivity(null, 'UPDATED', 'TRACKING_EXCEPTION', `Asked reason for exception #${id}`);
        res.json(exception);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update exception', details: error.message });
    }
});

// GET export CSV
router.get('/export', authenticateToken, async (_req, res) => {
    try {
        const exceptions = await prisma.trackingException.findMany({
            include: { user: { select: { name: true, department: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' }
        });

        const header = 'ID,Employee,Department,Type,Severity,Status,Description,Reason,Created At,Resolved At\n';
        const rows = exceptions.map(e =>
            `${e.id},"${e.user.name}","${e.user.department?.name || ''}","${e.type}",${e.severity},${e.status},"${e.description || ''}","${e.reason || ''}",${e.createdAt.toISOString()},${e.resolvedAt?.toISOString() || ''}`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tracking_exceptions.csv');
        res.send(header + rows);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to export exceptions', details: error.message });
    }
});

export default router;
