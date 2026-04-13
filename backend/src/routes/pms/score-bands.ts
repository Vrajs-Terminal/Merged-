import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all active bands
router.get('/', async (req, res) => {
    try {
        const bands = await prisma.pmsScoreBand.findMany({
            orderBy: { from_score: 'asc' }
        });
        res.json(bands);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Helper: find rating for a given score
router.get('/resolve', async (req, res) => {
    try {
        const score = Number(req.query.score);
        if (isNaN(score)) return res.status(400).json({ message: 'Invalid score' });

        const band = await prisma.pmsScoreBand.findFirst({
            where: {
                from_score: { lte: score },
                to_score: { gte: score },
                status: 'Active'
            }
        });
        res.json(band || { rating: 'Unrated', grade: '—' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create
router.post('/', async (req, res) => {
    try {
        const { from_score, to_score, rating, grade, remark, status } = req.body;
        if (from_score === undefined || to_score === undefined || !rating || !grade) {
            return res.status(400).json({ message: 'from_score, to_score, rating and grade are required' });
        }
        if (Number(from_score) >= Number(to_score)) {
            return res.status(400).json({ message: 'from_score must be less than to_score' });
        }

        const band = await prisma.pmsScoreBand.create({
            data: {
                from_score: Number(from_score),
                to_score: Number(to_score),
                rating,
                grade,
                remark: remark || null,
                status: status || 'Active'
            }
        });
        res.status(201).json(band);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    try {
        const { from_score, to_score, rating, grade, remark, status } = req.body;
        const updated = await prisma.pmsScoreBand.update({
            where: { id: Number(req.params.id) },
            data: { from_score: Number(from_score), to_score: Number(to_score), rating, grade, remark, status }
        });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await prisma.pmsScoreBand.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Score band deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
