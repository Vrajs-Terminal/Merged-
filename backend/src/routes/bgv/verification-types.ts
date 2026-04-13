import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all verification types
router.get('/', async (req, res) => {
    try {
        const types = await prisma.verificationType.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(types);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create verification type
router.post('/', async (req, res) => {
    try {
        const { name, description, status, added_by } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const type = await prisma.verificationType.create({
            data: {
                name,
                description: description || null,
                status: status || 'Active',
                added_by: added_by ? Number(added_by) : null
            }
        });
        res.status(201).json(type);
    } catch (err: any) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Verification type already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update verification type
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description, status } = req.body;

        const updated = await prisma.verificationType.update({
            where: { id },
            data: {
                name,
                description,
                status
            }
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
        await prisma.verificationType.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Verification type deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
