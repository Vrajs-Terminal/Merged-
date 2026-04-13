import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all sub-types
router.get('/', async (req, res) => {
    try {
        const types = await prisma.visitorSubType.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(types);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create sub-type
router.post('/', async (req, res) => {
    try {
        const { name, category, status } = req.body;
        if (!name || !category) return res.status(400).json({ message: 'Name and Category are required' });

        const type = await prisma.visitorSubType.create({
            data: {
                name,
                category,
                status: status || 'Active'
            }
        });
        res.status(201).json(type);
    } catch (err: any) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Visitor sub-type already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, category, status } = req.body;

        const updated = await prisma.visitorSubType.update({
            where: { id },
            data: { name, category, status }
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
        await prisma.visitorSubType.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
