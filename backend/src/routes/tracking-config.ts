import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// GET all tracking configs with user info
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, department } = req.query;

        const userWhere: any = {};
        if (search) userWhere.name = { contains: search as string };
        if (department && department !== 'All Departments') {
            userWhere.department = { name: department as string };
        }

        const users = await prisma.user.findMany({
            where: userWhere,
            select: {
                id: true, name: true, email: true,
                department: { select: { name: true } },
                branch: { select: { name: true } },
                trackingConfig: true
            },
            orderBy: { name: 'asc' }
        });

        const configs = users.map(u => ({
            userId: u.id,
            name: u.name,
            email: u.email,
            department: u.department?.name || 'N/A',
            branch: u.branch?.name || 'N/A',
            enabled: u.trackingConfig?.enabled ?? false,
            frequency: u.trackingConfig?.frequency ?? 15,
            workingHoursOnly: u.trackingConfig?.workingHoursOnly ?? true,
            configId: u.trackingConfig?.id || null
        }));

        const stats = {
            total: configs.length,
            enabled: configs.filter(c => c.enabled).length,
            disabled: configs.filter(c => !c.enabled).length
        };

        res.json({ configs, stats });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch tracking configs', details: error.message });
    }
});

// PATCH update individual config
router.patch('/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId as string);
        const { enabled, frequency, workingHoursOnly } = req.body;

        const config = await prisma.trackingConfig.upsert({
            where: { user_id: userId },
            update: { enabled, frequency, workingHoursOnly },
            create: {
                user_id: userId,
                enabled: enabled ?? true,
                frequency: frequency ?? 15,
                workingHoursOnly: workingHoursOnly ?? true
            }
        });

        await logActivity(null, 'UPDATED', 'TRACKING_CONFIG', `Updated tracking config for user #${userId}`);
        res.json(config);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update tracking config', details: error.message });
    }
});

// POST bulk enable/disable
router.post('/bulk', authenticateToken, async (req, res) => {
    try {
        const { userIds, enabled } = req.body;
        if (!Array.isArray(userIds)) {
            return res.status(400).json({ error: 'userIds must be an array' });
        }

        const results = [];
        for (const userId of userIds) {
            const config = await prisma.trackingConfig.upsert({
                where: { user_id: userId },
                update: { enabled },
                create: { user_id: userId, enabled }
            });
            results.push(config);
        }

        await logActivity(null, 'UPDATED', 'TRACKING_CONFIG', `Bulk ${enabled ? 'enabled' : 'disabled'} ${userIds.length} users`);
        res.json({ message: `Updated ${results.length} configs`, results });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to bulk update configs', details: error.message });
    }
});

// GET export CSV
router.get('/export', authenticateToken, async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, name: true,
                department: { select: { name: true } },
                branch: { select: { name: true } },
                trackingConfig: true
            },
            orderBy: { name: 'asc' }
        });

        const header = 'User ID,Name,Department,Branch,Tracking Enabled,Frequency (min),Working Hours Only\n';
        const rows = users.map(u =>
            `${u.id},"${u.name}","${u.department?.name || ''}","${u.branch?.name || ''}",${u.trackingConfig?.enabled ?? false},${u.trackingConfig?.frequency ?? 15},${u.trackingConfig?.workingHoursOnly ?? true}`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tracking_configs.csv');
        res.send(header + rows);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to export configs', details: error.message });
    }
});

export default router;
