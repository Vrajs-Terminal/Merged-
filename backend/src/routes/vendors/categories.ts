import { Router } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.vendorCategory.findMany({
            include: {
                _count: {
                    select: { vendors: true, subCategories: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        console.error("Error fetching vendor categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// GET single category
router.get('/:id', async (req, res) => {
    try {
        const category = await prisma.vendorCategory.findUnique({
            where: { id: Number(req.params.id) },
            include: { subCategories: true }
        });
        if (!category) return res.status(404).json({ error: "Category not found" });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch category" });
    }
});

// POST create category
router.post('/', async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const category = await prisma.vendorCategory.create({
            data: { name, description, status }
        });
        res.status(201).json(category);
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(400).json({ error: "Category name already exists" });
        res.status(500).json({ error: "Failed to create category" });
    }
});

// PUT update category
router.put('/:id', async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const category = await prisma.vendorCategory.update({
            where: { id: Number(req.params.id) },
            data: { name, description, status }
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to update category" });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        await prisma.vendorCategory.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});

export default router;
