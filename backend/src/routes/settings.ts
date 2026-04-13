import express from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = express.Router();

// Get setting by key
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await prisma.companySetting.findUnique({
            where: { key }
        });

        if (!setting) {
            return res.status(404).json({ error: "Setting not found" });
        }

        res.json(setting.value);
    } catch (error) {
        console.error("Error fetching setting:", error);
        res.status(500).json({ error: "Failed to fetch setting" });
    }
});

// Create or Update setting by key
router.put('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const value = req.body; // Expect JSON payload representing the setting data

        const upsertedSetting = await prisma.companySetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        await logActivity(null, 'UPDATED', 'COMPANY_SETTING', key);
        res.json(upsertedSetting);
    } catch (error) {
        console.error("Error saving setting:", error);
        res.status(500).json({ error: "Failed to save setting" });
    }
});

export default router;
