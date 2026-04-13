import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

/**
 * GET all optional holiday requests
 */
router.get('/', async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        let where: any = {};

        if (employeeId) where.userId = Number(employeeId);
        if (status) where.status = status;

        const requests = await prisma.optionalHolidayRequest.findMany({
            where,
            include: {
                user: { select: { name: true, employee_level_id: true } },
                holiday: { select: { name: true, date: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (err) {
        console.error('Fetch Holiday Requests Error:', err);
        res.status(500).json({ error: 'Failed to fetch holiday requests' });
    }
});

/**
 * POST submit an optional holiday request
 */
router.post('/', async (req, res) => {
    try {
        const { userId, holidayId, remarks } = req.body;

        if (!userId || !holidayId) {
            return res.status(400).json({ error: 'User ID and Holiday ID are required' });
        }

        // Validate if it's an optional holiday
        const holiday = await prisma.holiday.findUnique({ where: { id: holidayId } });
        if (!holiday || holiday.type !== 'Optional') {
            return res.status(400).json({ error: 'This is not an optional holiday' });
        }

        const request = await prisma.optionalHolidayRequest.create({
            data: {
                userId: Number(userId),
                holidayId: Number(holidayId),
                remarks,
                status: 'Pending'
            }
        });

        res.status(201).json(request);
    } catch (err) {
        console.error('Submit Holiday Request Error:', err);
        res.status(500).json({ error: 'Failed to submit holiday request' });
    }
});

/**
 * PATCH update request status (Approve/Reject)
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status, remarks } = req.body;

        if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updated = await prisma.optionalHolidayRequest.update({
            where: { id },
            data: { 
                status,
                remarks: remarks || undefined
            }
        });

        res.json(updated);
    } catch (err) {
        console.error('Update Request Status Error:', err);
        res.status(500).json({ error: 'Failed to update request status' });
    }
});

export default router;
