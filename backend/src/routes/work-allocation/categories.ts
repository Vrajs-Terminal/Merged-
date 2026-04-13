import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.workCategory.findMany({
            include: { createdBy: { select: { name: true, id: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Fetch categories error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST a new category
router.post('/', async (req, res) => {
    try {
        const { name, code, priority, status, sla_hours, description, created_by_id } = req.body;

        if (!name || !priority) {
            return res.status(400).json({ message: 'Name and priority are required' });
        }

        // Handle auto-code if not provided
        let finalCode = code;
        if (!finalCode) {
            const lastCat = await prisma.workCategory.findFirst({
                orderBy: { id: 'desc' }
            });
            const nextNumber = lastCat ? parseInt(lastCat.code.split('-')[1]) + 1 : 1;
            finalCode = `WRK-${nextNumber.toString().padStart(3, '0')}`;
        }

        // Check unique constraints
        const existingCat = await prisma.workCategory.findFirst({
            where: {
                OR: [ { name }, { code: finalCode } ]
            }
        });

        if (existingCat) {
            if (existingCat.name === name) {
                return res.status(400).json({ message: 'Category name already exists' });
            }
            if (existingCat.code === finalCode) {
                return res.status(400).json({ message: 'Category code already exists' });
            }
        }

        const category = await prisma.workCategory.create({
            data: {
                name,
                code: finalCode,
                priority,
                status: status || 'Active',
                sla_hours: sla_hours ? parseInt(sla_hours) : 24,
                description,
                created_by_id: created_by_id ? parseInt(created_by_id) : undefined,
            }
        });
        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, priority, status, sla_hours, description } = req.body;

        const category = await prisma.workCategory.update({
            where: { id: Number(id) },
            data: {
                name,
                code,
                priority,
                status,
                sla_hours: sla_hours ? parseInt(sla_hours) : undefined,
                description,
            }
        });
        res.status(200).json(category);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE (soft delete - mark inactive)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.workCategory.update({
            where: { id: Number(id) },
            data: { status: 'Inactive' }
        });
        res.status(200).json({ message: 'Category marked as Inactive' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
