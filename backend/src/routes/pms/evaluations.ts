import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// Helper: resolve rating from score bands
const resolveRating = async (score: number): Promise<{ rating: string; grade: string }> => {
    const band = await prisma.pmsScoreBand.findFirst({
        where: { from_score: { lte: score }, to_score: { gte: score }, status: 'Active' },
        orderBy: { from_score: 'desc' }
    });
    return band ? { rating: band.rating, grade: band.grade } : { rating: 'Unrated', grade: '—' };
};

// GET evaluations for an assignment
router.get('/', async (req, res) => {
    try {
        const { pms_assign_id, user_id, dimension_id } = req.query;
        const where: any = {};
        if (pms_assign_id) where.pmsAssignId = Number(pms_assign_id);
        if (user_id) where.userId = Number(user_id);
        if (dimension_id) where.dimensionId = Number(dimension_id);

        const evals = await prisma.pmsEvaluation.findMany({
            where,
            include: {
                user: { select: { id: true, name: true } },
                dimension: { select: { id: true, name: true, code: true } },
                evaluatedBy: { select: { id: true, name: true } },
                pmsAssign: { select: { id: true, pms_type: true, pms_date: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(evals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST upsert evaluation (create or update for pmsAssignId+userId+dimensionId)
router.post('/upsert', async (req, res) => {
    try {
        const {
            pms_assign_id, user_id, dimension_id,
            self_score, manager_score, weightage,
            remark, evaluator_type, evaluated_by_id
        } = req.body;

        if (!pms_assign_id || !user_id || !dimension_id) {
            return res.status(400).json({ message: 'pms_assign_id, user_id, dimension_id are required' });
        }

        const selfS = Number(self_score) || 0;
        const managerS = Number(manager_score) || 0;

        let final_score = managerS;
        if (evaluator_type === 'Both' && selfS > 0) {
            final_score = (selfS + managerS) / 2;
        } else if (evaluator_type === 'Self') {
            final_score = selfS;
        }

        const w = Number(weightage) || 0;
        const weighted_score = (final_score * w) / 100;

        const evaluation = await prisma.pmsEvaluation.upsert({
            where: {
                pmsAssignId_userId_dimensionId: {
                    pmsAssignId: Number(pms_assign_id),
                    userId: Number(user_id),
                    dimensionId: Number(dimension_id)
                }
            },
            update: {
                self_score: selfS, manager_score: managerS, final_score, weighted_score,
                weightage: w, remark, evaluator_type,
                evaluatedById: evaluated_by_id ? Number(evaluated_by_id) : null
            },
            create: {
                pmsAssignId: Number(pms_assign_id),
                userId: Number(user_id),
                dimensionId: Number(dimension_id),
                self_score: selfS, manager_score: managerS, final_score, weighted_score,
                weightage: w, remark, evaluator_type: evaluator_type || 'Manager',
                evaluatedById: evaluated_by_id ? Number(evaluated_by_id) : null
            }
        });

        // Update employee's evaluation status
        await prisma.pmsAssignEmployee.updateMany({
            where: { pmsAssignId: Number(pms_assign_id), userId: Number(user_id) },
            data: { evaluation_status: evaluator_type === 'Both' ? 'Completed' : (evaluator_type || 'Manager') }
        });

        res.json(evaluation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET full performance report with filters
router.get('/report', async (req, res) => {
    try {
        const { pms_assign_id, user_id, start_date, end_date, pms_type } = req.query;
        const where: any = {};
        if (pms_assign_id) where.pmsAssignId = Number(pms_assign_id);
        if (user_id) where.userId = Number(user_id);
        if (pms_type || start_date || end_date) {
            where.pmsAssign = {};
            if (pms_type) where.pmsAssign.pms_type = pms_type;
            if (start_date) where.pmsAssign.pms_date = { gte: new Date(start_date as string) };
            if (end_date) {
                where.pmsAssign.pms_date = {
                    ...where.pmsAssign.pms_date,
                    lte: new Date(end_date as string)
                };
            }
        }

        const rows = await prisma.pmsEvaluation.findMany({
            where,
            include: {
                user: { select: { id: true, name: true } },
                dimension: { select: { id: true, name: true, code: true } },
                pmsAssign: { select: { id: true, pms_type: true, pms_date: true } }
            },
            orderBy: [{ userId: 'asc' }, { dimensionId: 'asc' }]
        });

        const enriched = await Promise.all(rows.map(async (row) => {
            const rating = await resolveRating(row.final_score);
            return { ...row, ...rating };
        }));

        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE single evaluation
router.delete('/:id', async (req, res) => {
    try {
        await prisma.pmsEvaluation.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Evaluation deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
