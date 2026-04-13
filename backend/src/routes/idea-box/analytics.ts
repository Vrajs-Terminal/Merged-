import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

/**
 * GET Idea Leaderboard
 * Ranks users based on total reward points and approved ideas.
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const topContributors = await prisma.user.findMany({
            where: {
                ideasSubmitted: { some: { status: 'Approved' } }
            },
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        ideasSubmitted: { where: { status: 'Approved' } }
                    }
                },
                ideaRewardsReceived: {
                    select: { points: true }
                }
            },
            orderBy: {
                ideasSubmitted: { _count: 'desc' }
            },
            take: 10
        });

        // Compute total points per user
        const leaderboard = topContributors.map(u => ({
            id: u.id,
            name: u.name,
            approvedIdeas: u._count.ideasSubmitted,
            totalPoints: u.ideaRewardsReceived.reduce((sum, r) => sum + r.points, 0)
        })).sort((a, b) => b.totalPoints - a.totalPoints || b.approvedIdeas - a.approvedIdeas);

        res.json(leaderboard);
    } catch (err) {
        console.error('Fetch Leaderboard Error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

/**
 * GET General Idea Stats
 */
router.get('/stats', async (req, res) => {
    try {
        const totalIdeas = await prisma.idea.count();
        const approvedIdeas = await prisma.idea.count({ where: { status: 'Approved' } });
        const pendingIdeas = await prisma.idea.count({ where: { status: 'Pending' } });
        const implementedIdeas = await prisma.idea.count({ where: { status: 'Implemented' } });

        res.json({
            total: totalIdeas,
            approved: approvedIdeas,
            pending: pendingIdeas,
            implemented: implementedIdeas,
            approvalRate: totalIdeas > 0 ? (approvedIdeas / totalIdeas) * 100 : 0
        });
    } catch (err) {
        console.error('Fetch Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
