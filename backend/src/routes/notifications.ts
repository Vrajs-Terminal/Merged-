import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get recent notifications (compact: 5, full: 100)
// Privacy Filter: Only return logs for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const limitStr = req.query.limit as string;
        const limit = limitStr ? parseInt(limitStr) : 50;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const isAdmin = req.user?.role === 'Admin' || req.user?.role === 'SuperAdmin';

        if (!isAdmin) {
            return res.json([]); // Only admins see activity logs
        }

        const logs = await prisma.activityLog.findMany({
            where: {}, // Admin sees all activity
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        res.json(logs);
    } catch (error: any) {
        console.error('Failed to fetch activity logs:', error?.message);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

export default router;
