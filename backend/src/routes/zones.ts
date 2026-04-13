import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = Router();


// Get all Zones ordered logically
router.get('/', async (req, res) => {
    try {
        const zones = await prisma.zone.findMany({
            orderBy: { order_index: 'asc' },
            include: { branches: true }
        });
        res.json(zones);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch zones' });
    }
});

// Bulk Create Zones
router.post('/bulk', async (req, res) => {
    const { names } = req.body;

    if (!names || !Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ error: 'Valid array of names is required' });
    }

    try {
        const currentMax = await prisma.zone.aggregate({ _max: { order_index: true } });
        const startIndex = (currentMax._max.order_index || 0) + 1;

        const dataToInsert = names.map((name, i) => ({
            name: name.trim(),
            order_index: startIndex + i
        }));

        await prisma.zone.createMany({ data: dataToInsert, skipDuplicates: true });
        const user = (req as any).user;
        await Promise.all(names.map((n: string) => logActivity(user?.id || null, 'CREATED', 'ZONE', n.trim())));
        // Return fresh list
        const freshZones = await prisma.zone.findMany({ orderBy: { order_index: 'asc' } });
        res.status(201).json(freshZones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create zones' });
    }
});

// Update a Zone (Edit Name)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    try {
        const updated = await prisma.zone.update({
            where: { id: parseInt(id) },
            data: { name: name.trim() }
        });
        const user = (req as any).user;
        await logActivity(user?.id || null, 'UPDATED', 'ZONE', updated.name);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update zone' });
    }
});

// Bulk Reorder Zones
router.put('/action/reorder', async (req, res) => {
    const { orderedIds } = req.body;
    // Expects: [id1, id2, id3] in exact custom order

    if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'Invalid order array' });
    }

    try {
        const transaction = orderedIds.map((id: number, index: number) =>
            prisma.zone.update({
                where: { id },
                data: { order_index: index }
            })
        );

        const user = (req as any).user;
        await prisma.$transaction(transaction);
        await logActivity(user?.id || null, 'REORDERED', 'ZONE', 'Reordered zones');
        const sorted = await prisma.zone.findMany({ orderBy: { order_index: 'asc' } });
        res.json(sorted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder zones' });
    }
});

// Delete a Zone
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const zone = await prisma.zone.findUnique({
            where: { id: parseInt(id) },
            include: { branches: true }
        });

        if (!zone) return res.status(404).json({ error: 'Zone not found' });

        // Safety check: Prevent deleting a Zone that currently has branches assigned to it
        if (zone.branches.length > 0) {
            return res.status(400).json({ error: 'Cannot delete a Zone containing active Branches. Reassign the branches first.' });
        }

        const user = (req as any).user;
        await prisma.zone.delete({ where: { id: parseInt(id) } });
        await logActivity(user?.id || null, 'DELETED', 'ZONE', zone.name);
        res.json({ message: 'Zone deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete zone' });
    }
});

export default router;
