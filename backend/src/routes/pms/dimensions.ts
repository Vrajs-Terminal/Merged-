import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// Auto-generate code helper
const autoCode = async (): Promise<string> => {
    const count = await prisma.pmsDimension.count();
    return `DIM-${String(count + 1).padStart(3, '0')}`;
};

// GET all
router.get('/', async (req, res) => {
    try {
        const { status, search } = req.query;
        const where: any = {};
        if (status) where.status = status;
        if (search) where.name = { contains: search as string };

        const dimensions = await prisma.pmsDimension.findMany({
            where,
            include: { createdBy: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(dimensions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create
router.post('/', async (req, res) => {
    try {
        const { name, code, description, status, created_by_id } = req.body;
        if (!name) return res.status(400).json({ message: 'Dimension name is required' });

        const finalCode = code?.trim() || await autoCode();

        const existing = await prisma.pmsDimension.findUnique({ where: { code: finalCode } });
        if (existing) return res.status(400).json({ message: `Code "${finalCode}" already exists` });

        const dim = await prisma.pmsDimension.create({
            data: {
                name,
                code: finalCode,
                description: description || null,
                status: status || 'Active',
                createdById: created_by_id ? Number(created_by_id) : null
            }
        });
        res.status(201).json(dim);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    try {
        const { name, code, description, status } = req.body;
        const updated = await prisma.pmsDimension.update({
            where: { id: Number(req.params.id) },
            data: { name, code, description, status }
        });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PATCH toggle status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const dim = await prisma.pmsDimension.findUnique({ where: { id: Number(req.params.id) } });
        if (!dim) return res.status(404).json({ message: 'Not found' });
        const updated = await prisma.pmsDimension.update({
            where: { id: dim.id },
            data: { status: dim.status === 'Active' ? 'Inactive' : 'Active' }
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
        await prisma.pmsDimension.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Dimension deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error – may have linked evaluations' });
    }
});

export default router;
