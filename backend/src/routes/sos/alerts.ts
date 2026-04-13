import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

/**
 * GET list of all SOS alerts (with filters)
 */
router.get('/', async (req, res) => {
    try {
        const { employee_id, date_from, date_to, sos_type_id, status } = req.query;

        const where: any = {};
        if (employee_id) where.userId = Number(employee_id);
        if (sos_type_id) where.sosTypeId = Number(sos_type_id);
        if (status) where.status = String(status);
        if (date_from || date_to) {
            where.createdAt = {};
            if (date_from) where.createdAt.gte = new Date(String(date_from));
            if (date_to) where.createdAt.lte = new Date(String(date_to));
        }

        const alerts = await prisma.sosAlert.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, employee_level_id: true } },
                sosType: { select: { id: true, name: true, imageUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(alerts);
    } catch (err) {
        console.error('Fetch SOS Alerts Error:', err);
        res.status(500).json({ error: 'Failed to fetch SOS alerts' });
    }
});

/**
 * POST trigger a new SOS alert
 */
router.post('/', async (req, res) => {
    try {
        const { user_id, sos_type_id, message, imageUrl, latitude, longitude } = req.body;

        if (!user_id || !sos_type_id) {
            return res.status(400).json({ error: 'User ID and SOS Type ID are required' });
        }

        const alert = await prisma.sosAlert.create({
            data: {
                userId: Number(user_id),
                sosTypeId: Number(sos_type_id),
                message: message || null,
                imageUrl: imageUrl || null,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                status: 'Active'
            },
            include: {
                user: { select: { id: true, name: true } },
                sosType: { select: { id: true, name: true } }
            }
        });

        // Trigger notifications? (Future: WhatsApp, SMS, Push)
        res.status(201).json(alert);
    } catch (err) {
        console.error('Trigger SOS Alert Error:', err);
        res.status(500).json({ error: 'Failed to trigger SOS alert' });
    }
});

export default router;
