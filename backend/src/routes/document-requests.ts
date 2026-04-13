import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// Get all document requests (Admin only or filter by user)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const where: any = {};

        if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
            where.user_id = user.id;
        }

        const requests = await (prisma as any).documentRequest.findMany({
            where,
            include: { user: { select: { name: true } }, approver: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch document requests' });
    }
});

// Create a new document request
router.post('/', authenticateToken, async (req, res) => {
    const { request_type, requested_data, reason } = req.body;
    const user = (req as any).user;

    try {
        const request = await (prisma as any).documentRequest.create({
            data: {
                user_id: user.id,
                request_type,
                requested_data,
                reason,
                status: 'Pending'
            }
        });
        await logActivity(user.id, 'CREATED', 'DOCUMENT_REQUEST', request_type);
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create document request' });
    }
});

// Approve/Reject a request
router.put('/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const approver = (req as any).user;

    if (approver.role !== 'Admin' && approver.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const updated = await (prisma as any).documentRequest.update({
            where: { id: parseInt(id as string) },
            data: {
                status,
                approver_id: approver.id
            }
        });
        await logActivity(approver.id, 'UPDATED', 'DOCUMENT_REQUEST', `${updated.request_type} - ${status}`);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
