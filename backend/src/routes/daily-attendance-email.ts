import express from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = express.Router();

// Get all email settings
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.dailyAttendanceEmail.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(settings);
    } catch (error) {
        console.error("Error fetching daily attendance email settings:", error);
        res.status(500).json({ error: "Failed to fetch email settings" });
    }
});

// Create a new email setting
router.post('/', async (req, res) => {
    try {
        const { report_name, recipient_type, filter_value, schedule_time, email_template, status } = req.body;

        const newSetting = await prisma.dailyAttendanceEmail.create({
            data: {
                report_name,
                recipient_type: recipient_type || "Manager",
                filter_value,
                schedule_time,
                email_template,
                status: status || "Active"
            }
        });

        await logActivity(null, 'CREATED', 'ATTENDANCE_EMAIL_SETTING', report_name);
        res.status(201).json(newSetting);
    } catch (error) {
        console.error("Error creating email setting:", error);
        res.status(500).json({ error: "Failed to create email setting" });
    }
});

// Update an email setting
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { report_name, recipient_type, filter_value, schedule_time, email_template, status } = req.body;

        const updatedSetting = await prisma.dailyAttendanceEmail.update({
            where: { id: parseInt(id) },
            data: {
                report_name,
                recipient_type,
                filter_value,
                schedule_time,
                email_template,
                status
            }
        });

        await logActivity(null, 'UPDATED', 'ATTENDANCE_EMAIL_SETTING', report_name);
        res.json(updatedSetting);
    } catch (error) {
        console.error("Error updating email setting:", error);
        res.status(500).json({ error: "Failed to update email setting" });
    }
});

// Delete an email setting
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const setting = await prisma.dailyAttendanceEmail.findUnique({ where: { id: parseInt(id) } });
        await prisma.dailyAttendanceEmail.delete({
            where: { id: parseInt(id) }
        });
        if (setting) {
            await logActivity(null, 'DELETED', 'ATTENDANCE_EMAIL_SETTING', setting.report_name);
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting email setting:", error);
        res.status(500).json({ error: "Failed to delete email setting" });
    }
});

export default router;
