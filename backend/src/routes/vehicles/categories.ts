import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.vehicleCategory.findMany({
            include: {
                createdBy: { select: { id: true, name: true } },
                _count: { select: { vehicles: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create category
router.post('/', async (req, res) => {
    try {
        const { name, description, status, created_by_id } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });

        // Check duplicate name
        const existing = await prisma.vehicleCategory.findFirst({
            where: { name: { equals: name.trim() } }
        });
        if (existing) return res.status(409).json({ message: 'Category with this name already exists' });

        const category = await prisma.vehicleCategory.create({
            data: {
                name: name.trim(),
                description: description || null,
                status: status || 'Active',
                createdById: created_by_id ? Number(created_by_id) : null
            }
        });
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update category
router.put('/:id', async (req, res) => {
    try {
        const { name, description, status } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });

        const updated = await prisma.vehicleCategory.update({
            where: { id: Number(req.params.id) },
            data: { name: name.trim(), description: description || null, status }
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
        const cat = await prisma.vehicleCategory.findUnique({ where: { id: Number(req.params.id) } });
        if (!cat) return res.status(404).json({ message: 'Category not found' });
        const updated = await prisma.vehicleCategory.update({
            where: { id: cat.id },
            data: { status: cat.status === 'Active' ? 'Inactive' : 'Active' }
        });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        // Check if vehicles exist under this category
        const count = await prisma.employeeVehicle.count({ where: { categoryId: Number(req.params.id) } });
        if (count > 0) return res.status(400).json({ message: `Cannot delete: ${count} vehicle(s) are using this category` });

        await prisma.vehicleCategory.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
