import { Router } from 'express';
import prisma from '../../lib/prismaClient';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

// Module Status (Self-Health check)
router.get('/status', (req, res) => {
    res.json({ status: 'ok', name: 'Timeline Module', modules: 8 });
});

// Timeline Settings (Submodule 8)
router.get('/settings', authenticateToken, async (req, res) => {
    try {
        const settings = await prisma.timelineSetting.findMany();
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.post('/settings', authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'Admin' && (req as any).user.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const { key, value } = req.body;
    try {
        const updated = await prisma.timelineSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Notifications (Submodule 6)
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const notifs = await prisma.timelineNotification.findMany({
            where: { user_id: (req as any).user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifs);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Analytical Reports (Submodule 7)
router.get('/reports', authenticateToken, async (req, res) => {
    try {
        const totalPosts = await prisma.timelinePost.count();
        const totalReactions = await prisma.timelineReaction.count();
        const totalComments = await prisma.timelineComment.count();
        
        // Engagement rate (simple)
        const engagement = {
            total: totalReactions + totalComments,
            rate: totalPosts > 0 ? (totalReactions + totalComments) / totalPosts : 0
        };

        const topAuthors = await prisma.timelinePost.groupBy({
            by: ['author_id'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });

        res.json({
            stats: { totalPosts, totalReactions, totalComments, engagement },
            topAuthors
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
