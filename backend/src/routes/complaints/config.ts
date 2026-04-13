import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all receipt emails
router.get('/', async (req, res) => {
    try {
        const emails = await prisma.complaintEmail.findMany({
            orderBy: { email: 'asc' }
        });
        res.json(emails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST add email
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const count = await prisma.complaintEmail.count();
        if (count >= 10) return res.status(400).json({ message: 'Maximum 10 email recipients allowed' });

        const newEmail = await prisma.complaintEmail.create({
            data: { email }
        });
        res.status(201).json(newEmail);
    } catch (err: any) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE email
router.delete('/:id', async (req, res) => {
    try {
        await prisma.complaintEmail.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
