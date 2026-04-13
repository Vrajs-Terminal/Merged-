import { Router } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// GET all sub-categories
router.get('/', async (req, res) => {
    try {
        const { categoryId } = req.query;
        const where: any = {};
        if (categoryId) where.categoryId = Number(categoryId);

        const subCategories = await prisma.vendorSubCategory.findMany({
            where,
            include: {
                category: { select: { name: true } },
                _count: { select: { vendors: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(subCategories);
    } catch (error) {
        console.error("Error fetching vendor sub-categories:", error);
        res.status(500).json({ error: "Failed to fetch sub-categories" });
    }
});

// POST create sub-category
router.post('/', async (req, res) => {
    try {
        const { name, description, status, categoryId } = req.body;
        const subCategory = await prisma.vendorSubCategory.create({
            data: { name, description, status, categoryId: Number(categoryId) }
        });
        res.status(201).json(subCategory);
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(400).json({ error: "Sub-category already exists in this category" });
        res.status(500).json({ error: "Failed to create sub-category" });
    }
});

// PUT update sub-category
router.put('/:id', async (req, res) => {
    try {
        const { name, description, status, categoryId } = req.body;
        const subCategory = await prisma.vendorSubCategory.update({
            where: { id: Number(req.params.id) },
            data: { name, description, status, categoryId: Number(categoryId) }
        });
        res.json(subCategory);
    } catch (error) {
        res.status(500).json({ error: "Failed to update sub-category" });
    }
});

// DELETE sub-category
router.delete('/:id', async (req, res) => {
    try {
        await prisma.vendorSubCategory.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: "Sub-category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete sub-category" });
    }
});

export default router;
