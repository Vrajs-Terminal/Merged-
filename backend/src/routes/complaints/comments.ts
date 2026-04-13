import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET comments for a complaint
router.get('/:complaintId', async (req, res) => {
    try {
        const id = Number(req.params.complaintId);
        const { include_internal } = req.query;

        const where: any = { complaint_id: id };
        if (include_internal !== 'true') where.is_internal = false;

        const comments = await prisma.complaintComment.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST a comment
router.post('/', async (req, res) => {
    try {
        const { complaint_id, user_id, comment, is_internal } = req.body;
        if (!complaint_id || !user_id || !comment) {
            return res.status(400).json({ message: 'Complaint, User, and Comment are required' });
        }

        const newComment = await prisma.complaintComment.create({
            data: {
                complaint_id: Number(complaint_id),
                user_id: Number(user_id),
                comment,
                is_internal: Boolean(is_internal)
            },
            include: {
                user: { select: { id: true, name: true, role: true } }
            }
        });

        // Update complaint last_updated_at
        await prisma.complaint.update({
            where: { id: Number(complaint_id) },
            data: { last_updated_at: new Date() }
        });

        res.status(201).json(newComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
