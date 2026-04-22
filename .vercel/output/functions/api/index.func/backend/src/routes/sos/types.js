"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
/**
 * GET all SOS types
 */
router.get('/', async (req, res) => {
    try {
        const types = await prismaClient_1.default.sosType.findMany({
            include: {
                _count: { select: { alerts: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(types);
    }
    catch (err) {
        console.error('Fetch SOS Types Error:', err);
        res.status(500).json({ error: 'Failed to fetch SOS types' });
    }
});
/**
 * POST create/seed predefined SOS types
 */
router.post('/seed', async (req, res) => {
    try {
        const { selectedTypes } = req.body; // Array of strings like ["Fire", "Medical"]
        const defaultDurations = {
            'Fire': 60,
            'Thief': 60,
            'Stuck in Lift': 60,
            'Medical Emergency': 60,
            'Heat': 20,
            'HELLO': 1,
            'Earthquake': 120,
            'Abuse': 120,
            'Animal Threat': 30,
            'Employee Threat': 45,
            'Accident': 45,
            'Gas Leak': 30,
            'Panic': 15,
            'Security Breach': 60
        };
        const results = [];
        for (const typeName of selectedTypes) {
            const existing = await prismaClient_1.default.sosType.findUnique({ where: { name: typeName } });
            if (!existing) {
                const created = await prismaClient_1.default.sosType.create({
                    data: {
                        name: typeName,
                        isPredefined: true,
                        status: 'Active',
                        validityMinutes: defaultDurations[typeName] || 60
                    }
                });
                results.push(created);
            }
        }
        res.status(201).json({ message: 'SOS types seeded', count: results.length });
    }
    catch (err) {
        console.error('Seed SOS Types Error:', err);
        res.status(500).json({ error: 'Failed to seed SOS types' });
    }
});
/**
 * POST create new custom SOS type
 */
router.post('/', async (req, res) => {
    try {
        const { name, imageUrl, validityMinutes, status } = req.body;
        if (!(name === null || name === void 0 ? void 0 : name.trim()))
            return res.status(400).json({ error: 'SOS name is required' });
        const existing = await prismaClient_1.default.sosType.findUnique({
            where: { name: name.trim() }
        });
        if (existing)
            return res.status(409).json({ error: 'An SOS type with this name already exists' });
        const sosType = await prismaClient_1.default.sosType.create({
            data: {
                name: name.trim(),
                imageUrl: imageUrl || null,
                validityMinutes: validityMinutes ? Number(validityMinutes) : 60,
                status: status || 'Active',
                isPredefined: false
            }
        });
        res.status(201).json(sosType);
    }
    catch (err) {
        console.error('Create SOS Type Error:', err);
        res.status(500).json({ error: 'Failed to create SOS type' });
    }
});
/**
 * PUT update SOS type
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, imageUrl, validityMinutes, status } = req.body;
        const id = Number(req.params.id);
        if (!(name === null || name === void 0 ? void 0 : name.trim()))
            return res.status(400).json({ error: 'SOS name is required' });
        const existing = await prismaClient_1.default.sosType.findFirst({
            where: { name: name.trim(), id: { not: id } }
        });
        if (existing)
            return res.status(409).json({ error: 'Another SOS type with this name already exists' });
        const updated = await prismaClient_1.default.sosType.update({
            where: { id },
            data: {
                name: name.trim(),
                imageUrl: imageUrl || null,
                validityMinutes: validityMinutes ? Number(validityMinutes) : 60,
                status: status || 'Active'
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Update SOS Type Error:', err);
        res.status(500).json({ error: 'Failed to update SOS type' });
    }
});
/**
 * PATCH toggle SOS type status
 */
router.patch('/:id/toggle', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const type = await prismaClient_1.default.sosType.findUnique({ where: { id } });
        if (!type)
            return res.status(404).json({ error: 'SOS Type not found' });
        const updated = await prismaClient_1.default.sosType.update({
            where: { id },
            data: { status: type.status === 'Active' ? 'Inactive' : 'Active' }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Toggle SOS Type Error:', err);
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});
/**
 * DELETE SOS type
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const alertCount = await prismaClient_1.default.sosAlert.count({ where: { sosTypeId: id } });
        if (alertCount > 0) {
            return res.status(400).json({ error: `Cannot delete: ${alertCount} alert(s) are linked to this SOS type.` });
        }
        await prismaClient_1.default.sosType.delete({ where: { id } });
        res.json({ message: 'SOS type deleted successfully' });
    }
    catch (err) {
        console.error('Delete SOS Type Error:', err);
        res.status(500).json({ error: 'Failed to delete SOS type' });
    }
});
exports.default = router;
//# sourceMappingURL=types.js.map