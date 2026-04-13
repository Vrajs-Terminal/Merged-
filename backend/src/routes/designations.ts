import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = Router();


// Get all Designations
router.get('/', async (req, res) => {
    try {
        const designations = await prisma.designation.findMany({
            orderBy: { order_index: 'asc' },
            include: { subDepartment: true }
        });
        res.json(designations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch designations' });
    }
});

// Bulk Create Designations
router.post('/bulk', async (req, res) => {
    const { sub_department_id, names } = req.body;

    if (!sub_department_id || !names || !Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ error: 'Sub-Department ID and valid array of names are required' });
    }

    try {
        const sdId = parseInt(sub_department_id);

        const currentMax = await prisma.designation.aggregate({
            where: { sub_department_id: sdId },
            _max: { order_index: true }
        });
        const startIndex = (currentMax._max.order_index || 0) + 1;

        const dataToInsert = names.map((name, i) => ({
            name: name.trim(),
            sub_department_id: sdId,
            order_index: startIndex + i
        }));

        await prisma.designation.createMany({
            data: dataToInsert,
            skipDuplicates: true
        });

        const user = (req as any).user;
        await Promise.all(names.map((n: string) => logActivity(user?.id || null, 'CREATED', 'DESIGNATION', n.trim())));
        res.status(201).json({ message: 'Designations created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create designations' });
    }
});

// Update a Designation (Edit Name)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    try {
        const updated = await prisma.designation.update({
            where: { id: parseInt(id) },
            data: { name: name.trim() }
        });
        const user = (req as any).user;
        await logActivity(user?.id || null, 'UPDATED', 'DESIGNATION', updated.name);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update designation' });
    }
});

// Bulk Reorder Designations (Within a specific Sub-Department)
router.put('/action/reorder', async (req, res) => {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'Invalid order array' });
    }

    try {
        const transaction = orderedIds.map((id: number, index: number) =>
            prisma.designation.update({
                where: { id },
                data: { order_index: index }
            })
        );

        const user = (req as any).user;
        await prisma.$transaction(transaction);
        await logActivity(user?.id || null, 'REORDERED', 'DESIGNATION', 'Reordered designations');
        res.json({ message: 'Reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder designations' });
    }
});

// Delete a Designation
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Safe to delete outright as Designations are the lowest tier
        // and have no child tables dependent on them yet.
        const user = (req as any).user;
        await prisma.designation.delete({ where: { id: parseInt(id) } });
        await logActivity(user?.id || null, 'DELETED', 'DESIGNATION', `Designation #${id}`);
        res.json({ message: 'Designation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete designation' });
    }
});

export default router;
