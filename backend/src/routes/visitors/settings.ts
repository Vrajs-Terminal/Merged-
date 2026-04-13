import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all settings
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.visitorSetting.findMany({
            orderBy: { key: 'asc' }
        });
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST or PUT (Upsert) settings
router.post('/batch', async (req, res) => {
    try {
        const settings: { key: string; value: string; type?: string }[] = req.body;
        if (!Array.isArray(settings)) return res.status(400).json({ message: 'Array of settings expected' });

        const operations = settings.map(s => prisma.visitorSetting.upsert({
            where: { key: s.key },
            update: { value: s.value, type: s.type || 'String' },
            create: { key: s.key, value: s.value, type: s.type || 'String' }
        }));

        const results = await Promise.all(operations);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Initialize default settings if missing
router.post('/initialize-defaults', async (req, res) => {
    try {
        const defaults = [
            { key: 'AUTO_REJECT_MINS', value: '120', type: 'Number' },
            { key: 'AUTO_HOLD_MINS', value: '30', type: 'Number' },
            { key: 'DEFAULT_APPROVAL_STATUS', value: 'Approved', type: 'String' },
            { key: 'VISITOR_ADDRESS_REQUIRED', value: 'No', type: 'Boolean' },
            { key: 'VISITOR_CITY_REQUIRED', value: 'Yes', type: 'Boolean' },
            { key: 'VISITOR_AREA_REQUIRED', value: 'No', type: 'Boolean' },
            { key: 'VISITOR_REASON_REQUIRED', value: 'Yes', type: 'Boolean' },
            { key: 'VISITOR_PHOTO_REQUIRED', value: 'Yes', type: 'Boolean' },
            { key: 'VEHICLE_NO_REQUIRED', value: 'No', type: 'Boolean' },
            { key: 'FACE_VERIFICATION_ENABLED', value: 'No', type: 'Boolean' }
        ];

        const operations = defaults.map(d => prisma.visitorSetting.upsert({
            where: { key: d.key },
            update: {}, // don't overwrite if already exists
            create: d
        }));

        await Promise.all(operations);
        res.json({ message: 'Default settings initialized' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
