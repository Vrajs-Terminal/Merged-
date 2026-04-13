import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

/**
 * GET all SOS types
 */
router.get('/', async (req, res) => {
    try {
        const types = await prisma.sosType.findMany({
            include: {
                _count: { select: { alerts: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(types);
    } catch (err) {
        console.error('Fetch SOS Types Error:', err);
        res.status(500).json({ error: 'Failed to fetch SOS types' });
    }
});

/**
 * POST create/seed predefined SOS types
 */
router.post('/seed', async (req, res) => {
    try {
        const { selectedTypes } = req.body; // Array of strings like ["Fire", "Medical"]
        
        const defaultDurations: Record<string, number> = {
            'Fire': 60,
            'Thief': 60,
            'Stuck in Lift': 60,
            'Medical Emergency': 60,
            'Heat': 20,
            'HELLO': 1,
            'Earthquake': 120,
            'Abuse': 120,
            'Animal Threat': 30,
            'Employee Threat': 45,
            'Accident': 45,
            'Gas Leak': 30,
            'Panic': 15,
            'Security Breach': 60
        };

        const results = [];
        for (const typeName of selectedTypes) {
            const existing = await prisma.sosType.findUnique({ where: { name: typeName } });
            if (!existing) {
                const created = await prisma.sosType.create({
                    data: {
                        name: typeName,
                        isPredefined: true,
                        status: 'Active',
                        validityMinutes: defaultDurations[typeName] || 60
                    }
                });
                results.push(created);
            }
        }
        res.status(201).json({ message: 'SOS types seeded', count: results.length });
    } catch (err) {
        console.error('Seed SOS Types Error:', err);
        res.status(500).json({ error: 'Failed to seed SOS types' });
    }
});

/**
 * POST create new custom SOS type
 */
router.post('/', async (req, res) => {
    try {
        const { name, imageUrl, validityMinutes, status } = req.body;
        if (!name?.trim()) return res.status(400).json({ error: 'SOS name is required' });

        const existing = await prisma.sosType.findUnique({
            where: { name: name.trim() }
        });
        if (existing) return res.status(409).json({ error: 'An SOS type with this name already exists' });

        const sosType = await prisma.sosType.create({
            data: {
                name: name.trim(),
                imageUrl: imageUrl || null,
                validityMinutes: validityMinutes ? Number(validityMinutes) : 60,
                status: status || 'Active',
                isPredefined: false
            }
        });
        res.status(201).json(sosType);
    } catch (err) {
        console.error('Create SOS Type Error:', err);
        res.status(500).json({ error: 'Failed to create SOS type' });
    }
});

/**
 * PUT update SOS type
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, imageUrl, validityMinutes, status } = req.body;
        const id = Number(req.params.id);

        if (!name?.trim()) return res.status(400).json({ error: 'SOS name is required' });

        const existing = await prisma.sosType.findFirst({
            where: { name: name.trim(), id: { not: id } }
        });
        if (existing) return res.status(409).json({ error: 'Another SOS type with this name already exists' });

        const updated = await prisma.sosType.update({
            where: { id },
            data: {
                name: name.trim(),
                imageUrl: imageUrl || null,
                validityMinutes: validityMinutes ? Number(validityMinutes) : 60,
                status: status || 'Active'
            }
        });
        res.json(updated);
    } catch (err) {
        console.error('Update SOS Type Error:', err);
        res.status(500).json({ error: 'Failed to update SOS type' });
    }
});

/**
 * PATCH toggle SOS type status
 */
router.patch('/:id/toggle', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const type = await prisma.sosType.findUnique({ where: { id } });
        if (!type) return res.status(404).json({ error: 'SOS Type not found' });

        const updated = await prisma.sosType.update({
            where: { id },
            data: { status: type.status === 'Active' ? 'Inactive' : 'Active' }
        });
        res.json(updated);
    } catch (err) {
        console.error('Toggle SOS Type Error:', err);
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});

/**
 * DELETE SOS type
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        
        const alertCount = await prisma.sosAlert.count({ where: { sosTypeId: id } });
        if (alertCount > 0) {
            return res.status(400).json({ error: `Cannot delete: ${alertCount} alert(s) are linked to this SOS type.` });
        }

        await prisma.sosType.delete({ where: { id } });
        res.json({ message: 'SOS type deleted successfully' });
    } catch (err) {
        console.error('Delete SOS Type Error:', err);
        res.status(500).json({ error: 'Failed to delete SOS type' });
    }
});

export default router;
