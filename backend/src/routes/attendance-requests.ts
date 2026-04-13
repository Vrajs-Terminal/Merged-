import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// =====================================
// Submit a Request (Employee)
// =====================================
router.post('/', authenticateToken, async (req, res) => {
    const { request_type, date, requested_data, reason } = req.body;
    const user = (req as any).user;

    if (!request_type || !date || !reason) {
        return res.status(400).json({ error: 'Type, Date, and Reason are required' });
    }

    try {
        const dateObj = new Date(date);

        const request = await prisma.attendanceRequest.create({
            data: {
                user_id: user.id,
                request_type,
                date: dateObj,
                requested_data: requested_data || {},
                reason,
                status: 'Pending'
            }
        });

        await logActivity(user.id, 'CREATED', 'ATTENDANCE_REQUEST', request_type);
        res.status(201).json({ message: `${request_type} request submitted successfully`, request });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to submit request', details: error.message });
    }
});


// =====================================
// Fetch Requests (Admin lists vs Employee logs)
// =====================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, user_id, type } = req.query;
        const user = (req as any).user;
        const whereClause: any = {};

        // Security check
        if (user.role !== 'Admin' && user.role !== 'Super Admin') {
            whereClause.user_id = user.id; // Employees only see their own requests
        } else if (user_id) {
            whereClause.user_id = parseInt(user_id as string);
        }

        if (status) whereClause.status = status;
        if (type) whereClause.request_type = type;

        const requests = await prisma.attendanceRequest.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, employee_grade_id: true } },
                approver: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch requests', details: error.message });
    }
});


// =====================================
// Approve or Reject a Request (Manager/HR)
// =====================================
router.put('/:id/review', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, approver_remarks } = req.body; // 'Approved' or 'Rejected'
    const user = (req as any).user;

    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
        return res.status(403).json({ error: 'Unauthorized. Only admins can review requests.' });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Approved or Rejected' });
    }

    try {
        const request = await prisma.attendanceRequest.update({
            where: { id: parseInt(id as string) },
            data: {
                status,
                approver_id: user.id,
                approver_remarks
            }
        });

        await logActivity(user.id, 'UPDATED', 'ATTENDANCE_REQUEST', `Request #${id} marked as ${status}`);
        res.json({ message: `Request successfully ${status.toLowerCase()}`, request });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to review request', details: error.message });
    }
});


// =====================================
// Delete/Cancel a Pending Request
// =====================================
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;

    try {
        const existing = await prisma.attendanceRequest.findUnique({ where: { id: parseInt(id as string) } });
        if (!existing) return res.status(404).json({ error: 'Not found' });

        if (existing.user_id !== user.id && user.role !== 'Admin') {
            return res.status(403).json({ error: 'Unauthorized to cancel this request.' });
        }

        if (existing.status !== 'Pending' && user.role !== 'Admin') {
            return res.status(400).json({ error: 'Cannot cancel an already processed request.' });
        }

        await prisma.attendanceRequest.delete({ where: { id: parseInt(id as string) } });
        await logActivity(user.id, 'DELETED', 'ATTENDANCE_REQUEST', `Cancelled request #${id}`);

        res.json({ message: 'Request cancelled successfully.' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete request', details: error.message });
    }
});

export default router;
