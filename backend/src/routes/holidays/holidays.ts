import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

/**
 * GET all holidays
 */
router.get('/', async (req, res) => {
    try {
        const { year, branchId, type } = req.query;
        let where: any = {};

        if (year) {
            const startOfYear = new Date(`${year}-01-01`);
            const endOfYear = new Date(`${year}-12-31`);
            where.date = {
                gte: startOfYear,
                lte: endOfYear
            };
        }

        if (type) {
            where.type = type;
        }

        const holidays = await prisma.holiday.findMany({
            where,
            orderBy: { date: 'asc' }
        });

        // Manual filtering for branchIds stored as JSON array
        let filteredHolidays = holidays;
        if (branchId) {
            const bId = Number(branchId);
            filteredHolidays = holidays.filter((h: any) => {
                const bIds = h.branchIds as number[];
                return !bIds || bIds.length === 0 || bIds.includes(bId);
            });
        }

        res.json(filteredHolidays);
    } catch (err) {
        console.error('Fetch Holidays Error:', err);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
});

/**
 * POST create a new holiday
 */
router.post('/', async (req, res) => {
    try {
        const { name, date, type, branchIds, description } = req.body;

        if (!name || !date || !type) {
            return res.status(400).json({ error: 'Name, Date, and Type are required' });
        }

        const holiday = await prisma.holiday.create({
            data: {
                name,
                date: new Date(date),
                type,
                branchIds: branchIds || [],
                description,
                status: 'Active'
            }
        });

        res.status(201).json(holiday);
    } catch (err) {
        console.error('Create Holiday Error:', err);
        res.status(500).json({ error: 'Failed to create holiday' });
    }
});

/**
 * PUT update a holiday
 */
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, date, type, branchIds, description, status } = req.body;

        const updated = await prisma.holiday.update({
            where: { id },
            data: {
                name,
                date: date ? new Date(date) : undefined,
                type,
                branchIds,
                description,
                status
            }
        });

        res.json(updated);
    } catch (err) {
        console.error('Update Holiday Error:', err);
        res.status(500).json({ error: 'Failed to update holiday' });
    }
});

/**
 * PATCH toggle holiday status
 */
router.patch('/:id/toggle', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const holiday = await prisma.holiday.findUnique({ where: { id } });
        
        if (!holiday) return res.status(404).json({ error: 'Holiday not found' });

        const updated = await prisma.holiday.update({
            where: { id },
            data: { status: holiday.status === 'Active' ? 'Inactive' : 'Active' }
        });

        res.json(updated);
    } catch (err) {
        console.error('Toggle Holiday Error:', err);
        res.status(500).json({ error: 'Failed to toggle holiday' });
    }
});

/**
 * DELETE a holiday
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.holiday.delete({ where: { id } });
        res.json({ message: 'Holiday deleted successfully' });
    } catch (err) {
        console.error('Delete Holiday Error:', err);
        res.status(500).json({ error: 'Failed to delete holiday' });
    }
});

export default router;
