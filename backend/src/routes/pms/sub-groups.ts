import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all sub-groups (with linked dimensions)
router.get('/', async (req, res) => {
    try {
        const subGroups = await prisma.pmsDimensionSubGroup.findMany({
            include: {
                dimensions: {
                    include: { dimension: { select: { id: true, name: true, code: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subGroups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create sub-group with dimension links
router.post('/', async (req, res) => {
    try {
        const { name, weightage_type, total_weightage, description, status, dimensions } = req.body;
        if (!name) return res.status(400).json({ message: 'Sub-group name is required' });

        // Validate weightage sums to 100 if Percentage
        if (weightage_type === 'Percentage' && dimensions?.length) {
            const total = dimensions.reduce((sum: number, d: any) => sum + Number(d.weightage), 0);
            if (Math.abs(total - 100) > 0.01) {
                return res.status(400).json({ message: `Dimension weightages must sum to 100% (currently ${total}%)` });
            }
        }

        const subGroup = await prisma.pmsDimensionSubGroup.create({
            data: {
                name,
                weightage_type: weightage_type || 'Percentage',
                total_weightage: Number(total_weightage) || 100,
                description: description || null,
                status: status || 'Active',
                dimensions: dimensions?.length ? {
                    create: dimensions.map((d: any) => ({
                        dimensionId: Number(d.dimensionId),
                        weightage: Number(d.weightage) || 0
                    }))
                } : undefined
            },
            include: { dimensions: { include: { dimension: true } } }
        });
        res.status(201).json(subGroup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update sub-group — recreate dimension links
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, weightage_type, total_weightage, description, status, dimensions } = req.body;

        // Delete existing links, then recreate
        await prisma.pmsDimSubGroupDimension.deleteMany({ where: { subGroupId: id } });

        const updated = await prisma.pmsDimensionSubGroup.update({
            where: { id },
            data: {
                name,
                weightage_type,
                total_weightage: Number(total_weightage),
                description,
                status,
                dimensions: dimensions?.length ? {
                    create: dimensions.map((d: any) => ({
                        dimensionId: Number(d.dimensionId),
                        weightage: Number(d.weightage) || 0
                    }))
                } : undefined
            },
            include: { dimensions: { include: { dimension: true } } }
        });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await prisma.pmsDimensionSubGroup.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Sub-group deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
