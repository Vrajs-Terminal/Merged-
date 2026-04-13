import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

/**
 * POST resolve an SOS alert
 */
router.post('/:id/resolve', async (req, res) => {
    try {
        const id = Number(req.params.id);
        
        const updated = await prisma.sosAlert.update({
            where: { id },
            data: {
                status: 'Resolved',
                resolvedAt: new Date()
            }
        });

        res.json(updated);
    } catch (err) {
        console.error('Resolve SOS Alert Error:', err);
        res.status(500).json({ error: 'Failed to resolve SOS alert' });
    }
});

/**
 * POST close an SOS alert
 */
router.post('/:id/close', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const updated = await prisma.sosAlert.update({
            where: { id },
            data: {
                status: 'Closed',
                closedAt: new Date()
            }
        });

        res.json(updated);
    } catch (err) {
        console.error('Close SOS Alert Error:', err);
        res.status(500).json({ error: 'Failed to close SOS alert' });
    }
});

export default router;
