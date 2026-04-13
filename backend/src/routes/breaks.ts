import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// Get active break for current user
router.get('/active', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const activeBreak = await (prisma as any).breakLog.findFirst({
            where: { user_id: user.id, status: 'Ongoing' }
        });
        res.json(activeBreak);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Start a break
router.post('/start', authenticateToken, async (req, res) => {
    const user = (req as any).user;
    const { break_type } = req.body;

    try {
        // Check if already on break
        const existing = await (prisma as any).breakLog.findFirst({
            where: { user_id: user.id, status: 'Ongoing' }
        });
        if (existing) return res.status(400).json({ error: 'Already on a break' });

        // Find today's attendance record
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await prisma.attendanceRecord.findUnique({
            where: { user_id_date: { user_id: user.id, date: today } }
        });

        const newBreak = await (prisma as any).breakLog.create({
            data: {
                user_id: user.id,
                attendance_id: attendance?.id,
                break_type: break_type || 'Standard',
                status: 'Ongoing'
            }
        });
        await logActivity(user.id, 'STARTED', 'BREAK', break_type);
        res.status(201).json(newBreak);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// End a break
router.post('/end', authenticateToken, async (req, res) => {
    const user = (req as any).user;

    try {
        const activeBreak = await (prisma as any).breakLog.findFirst({
            where: { user_id: user.id, status: 'Ongoing' }
        });
        if (!activeBreak) return res.status(400).json({ error: 'No active break found' });

        const endTime = new Date();
        const durationMins = Math.round((endTime.getTime() - activeBreak.start_time.getTime()) / 60000);

        const updated = await (prisma as any).breakLog.update({
            where: { id: activeBreak.id },
            data: {
                end_time: endTime,
                duration_minutes: durationMins,
                status: 'Completed'
            }
        });

        // Update attendance record total break minutes
        if (activeBreak.attendance_id) {
            await (prisma as any).attendanceRecord.update({
                where: { id: activeBreak.attendance_id },
                data: {
                    break_minutes: { increment: durationMins }
                }
            });
        }

        await logActivity(user.id, 'ENDED', 'BREAK', `${activeBreak.break_type} (${durationMins} mins)`);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
