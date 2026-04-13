import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

const resolveRating = async (score: number): Promise<{ rating: string; grade: string }> => {
    const band = await prisma.pmsScoreBand.findFirst({
        where: { from_score: { lte: score }, to_score: { gte: score }, status: 'Active' },
        orderBy: { from_score: 'desc' }
    });
    return band ? { rating: band.rating, grade: band.grade } : { rating: 'Unrated', grade: '—' };
};

// GET aggregated performance summary per employee per assignment
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, pms_assign_id, pms_type, start_date, end_date } = req.query;

        const assignWhere: any = {};
        if (branch_id) assignWhere.branchId = Number(branch_id);
        if (department_id) assignWhere.departmentId = Number(department_id);
        if (pms_assign_id) assignWhere.id = Number(pms_assign_id);
        if (pms_type) assignWhere.pms_type = pms_type;
        if (start_date) assignWhere.pms_date = { gte: new Date(start_date as string) };
        if (end_date) assignWhere.pms_date = { ...assignWhere.pms_date, lte: new Date(end_date as string) };

        const evals = await prisma.pmsEvaluation.findMany({
            where: { pmsAssign: Object.keys(assignWhere).length ? assignWhere : undefined },
            include: {
                user: { select: { id: true, name: true } },
                pmsAssign: { select: { id: true, pms_type: true, pms_date: true } }
            }
        });

        // Group by user + pmsAssign
        const grouped: Record<string, {
            user: { id: number; name: string };
            pmsAssign: { id: number; pms_type: string; pms_date: Date };
            totalWeightedScore: number;
            totalWeightage: number;
            dimensionCount: number;
            completedCount: number;
        }> = {};

        for (const ev of evals) {
            const key = `${ev.userId}_${ev.pmsAssignId}`;
            if (!grouped[key]) {
                grouped[key] = {
                    user: ev.user,
                    pmsAssign: ev.pmsAssign,
                    totalWeightedScore: 0,
                    totalWeightage: 0,
                    dimensionCount: 0,
                    completedCount: 0
                };
            }
            grouped[key].totalWeightedScore += ev.weighted_score;
            grouped[key].totalWeightage += ev.weightage;
            grouped[key].dimensionCount += 1;
            if (ev.final_score > 0) grouped[key].completedCount += 1;
        }

        const summary: Array<{
            userId: number; employeeName: string; pmsAssignId: number;
            pmsType: string; pmsDate: Date; totalScore: number;
            dimensionCount: number; completedCount: number; completionPct: number;
            rating: string; grade: string; remark: string; rank?: number;
        }> = await Promise.all(Object.values(grouped).map(async (g) => {
            const finalScore = g.totalWeightage > 0
                ? (g.totalWeightedScore / g.totalWeightage) * 100
                : g.totalWeightedScore;
            const { rating, grade } = await resolveRating(finalScore);
            return {
                userId: g.user.id,
                employeeName: g.user.name,
                pmsAssignId: g.pmsAssign.id,
                pmsType: g.pmsAssign.pms_type,
                pmsDate: g.pmsAssign.pms_date,
                totalScore: Math.round(finalScore * 100) / 100,
                dimensionCount: g.dimensionCount,
                completedCount: g.completedCount,
                completionPct: g.dimensionCount > 0
                    ? Math.round((g.completedCount / g.dimensionCount) * 100) : 0,
                rating,
                grade,
                remark: (rating === 'Outstanding' || rating === 'Excellent') ? '⭐ Top Performer' : ''
            };
        }));

        summary.sort((a, b) => b.totalScore - a.totalScore);
        summary.forEach((s, i) => { s.rank = i + 1; });

        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET leaderboard — top N performers
router.get('/leaderboard', async (req, res) => {
    try {
        const { top = '10', pms_type, start_date, end_date } = req.query;

        const assignWhere: any = {};
        if (pms_type) assignWhere.pms_type = pms_type;
        if (start_date) assignWhere.pms_date = { gte: new Date(start_date as string) };
        if (end_date) assignWhere.pms_date = { ...assignWhere.pms_date, lte: new Date(end_date as string) };

        const evals = await prisma.pmsEvaluation.findMany({
            where: Object.keys(assignWhere).length ? { pmsAssign: assignWhere } : undefined,
            include: { user: { select: { id: true, name: true } } }
        });

        const userMap: Record<number, { user: { id: number; name: string }; totalWeightedScore: number; count: number }> = {};
        for (const ev of evals) {
            if (!userMap[ev.userId]) {
                userMap[ev.userId] = { user: ev.user, totalWeightedScore: 0, count: 0 };
            }
            userMap[ev.userId].totalWeightedScore += ev.weighted_score;
            userMap[ev.userId].count += 1;
        }

        const leaders = Object.values(userMap)
            .map((u) => ({
                userId: u.user.id,
                name: u.user.name,
                avgScore: u.count > 0 ? Math.round((u.totalWeightedScore / u.count) * 100) / 100 : 0,
                rank: 0,
                medal: ''
            }))
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, Number(top));

        leaders.forEach((l, i) => {
            l.rank = i + 1;
            l.medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅';
        });

        res.json(leaders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
