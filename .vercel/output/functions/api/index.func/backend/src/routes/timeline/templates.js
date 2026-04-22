"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Get active templates for design or preview (Submodule 3)
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const templates = await prismaClient_1.default.timelineTemplate.findMany();
        res.json(templates);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch templates', details: error.message });
    }
});
// Create/Update Template (Admin only)
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const { id, name, type, bg_image, config, is_active } = req.body;
    try {
        const template = await prismaClient_1.default.timelineTemplate.upsert({
            where: { id: id || -1 },
            update: { name, type, bg_image, config, is_active },
            create: { name, type, bg_image, config, is_active }
        });
        res.status(201).json(template);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save template', details: error.message });
    }
});
// Delete Template (Admin only)
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        await prismaClient_1.default.timelineTemplate.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Template deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete template', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=templates.js.map