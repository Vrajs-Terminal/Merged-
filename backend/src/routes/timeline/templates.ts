import { Router } from 'express';
import prisma from '../../lib/prismaClient';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

// Get active templates for design or preview (Submodule 3)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const templates = await prisma.timelineTemplate.findMany();
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch templates', details: error.message });
    }
});

// Create/Update Template (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'Admin' && (req as any).user.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id, name, type, bg_image, config, is_active } = req.body;
    try {
        const template = await prisma.timelineTemplate.upsert({
            where: { id: id || -1 },
            update: { name, type, bg_image, config, is_active },
            create: { name, type, bg_image, config, is_active }
        });
        res.status(201).json(template);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to save template', details: error.message });
    }
});

// Delete Template (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    if ((req as any).user.role !== 'Admin' && (req as any).user.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        await prisma.timelineTemplate.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Template deleted' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete template', details: error.message });
    }
});

export default router;
