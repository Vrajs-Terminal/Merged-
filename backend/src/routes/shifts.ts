import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// Get all shifts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const shifts = await prisma.shift.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(shifts);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch shifts', details: error.message });
    }
});

// Create a new shift
router.post('/', authenticateToken, async (req, res) => {
    const {
        name,
        start_time,
        end_time,
        grace_time_minutes,
        half_day_min_hours,
        full_day_min_hours,
        break_duration_mins
    } = req.body;

    if (!name || !start_time || !end_time) {
        return res.status(400).json({ error: 'Name, start time, and end time are required' });
    }

    try {
        const shift = await prisma.shift.create({
            data: {
                name,
                start_time,
                end_time,
                grace_time_minutes: grace_time_minutes || 0,
                half_day_min_hours: half_day_min_hours || 4.0,
                full_day_min_hours: full_day_min_hours || 8.0,
                break_duration_mins: break_duration_mins || 60
            }
        });

        const user = (req as any).user;
        await logActivity(user.id, 'CREATED', 'SHIFT', shift.name);
        res.status(201).json({ message: 'Shift created successfully', shift });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create shift', details: error.message });
    }
});

// Update a shift
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const {
        name,
        start_time,
        end_time,
        grace_time_minutes,
        half_day_min_hours,
        full_day_min_hours,
        break_duration_mins,
        is_active
    } = req.body;

    try {
        const shift = await prisma.shift.update({
            where: { id: parseInt(id as string) },
            data: {
                name,
                start_time,
                end_time,
                grace_time_minutes,
                half_day_min_hours,
                full_day_min_hours,
                break_duration_mins,
                is_active
            }
        });

        const user = (req as any).user;
        await logActivity(user.id, 'UPDATED', 'SHIFT', shift.name);
        res.json({ message: 'Shift updated successfully', shift });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update shift', details: error.message });
    }
});

// Delete a shift
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Prevent deletion if users are assigned to it
        const usersCount = await prisma.user.count({ where: { shift_id: parseInt(id as string) } });
        if (usersCount > 0) {
            return res.status(400).json({ error: 'Cannot delete shift as it is assigned to employees. Please reassign them first.' });
        }

        const shift = await prisma.shift.delete({
            where: { id: parseInt(id as string) }
        });

        const user = (req as any).user;
        await logActivity(user.id, 'DELETED', 'SHIFT', shift.name);
        res.json({ message: 'Shift deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete shift', details: error.message });
    }
});

export default router;
