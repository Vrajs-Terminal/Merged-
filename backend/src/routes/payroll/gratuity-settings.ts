import express from 'express';
import prisma from '../../lib/prismaClient';
import { logActivity } from '../../services/activityLogger';

const router = express.Router();

// GET / — Get current gratuity settings
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.gratuitySetting.findFirst();
        res.json(settings || {
            enabled: false,
            min_service_years: 5,
            formula: "(Last Drawn Salary * 15 * Number of Completed Years) / 26",
            included_components: [],
            max_limit: 2000000,
            round_off: true,
            applicable_on_resignation: true,
            auto_calculate_fnf: true
        });
    } catch (error) {
        console.error("Error fetching gratuity settings:", error);
        res.status(500).json({ error: "Failed to fetch gratuity settings" });
    }
});

// POST / — Upsert gratuity settings
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const existing = await prisma.gratuitySetting.findFirst();

        let result;
        if (existing) {
            result = await prisma.gratuitySetting.update({
                where: { id: existing.id },
                data
            });
        } else {
            result = await prisma.gratuitySetting.create({
                data
            });
        }

        await logActivity(null, existing ? 'UPDATED' : 'CREATED', 'GRATUITY_SETTINGS', 'Global Configuration');
        res.json(result);
    } catch (error) {
        console.error("Error saving gratuity settings:", error);
        res.status(500).json({ error: "Failed to save gratuity settings" });
    }
});

export default router;
