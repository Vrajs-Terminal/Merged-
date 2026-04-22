"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// GET all geofences
router.get('/', authMiddleware_1.authenticateToken, async (_req, res) => {
    try {
        const geofences = await prismaClient_1.default.geofence.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(geofences);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch geofences', details: error.message });
    }
});
// POST create geofence
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { name, latitude, longitude, radius, punchRule } = req.body;
        if (!name || !latitude || !longitude) {
            return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
        }
        const geofence = await prismaClient_1.default.geofence.create({
            data: {
                name,
                latitude,
                longitude,
                radius: radius || 200,
                punchRule: punchRule || 'inside_only'
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'CREATED', 'GEOFENCE', name);
        res.status(201).json(geofence);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create geofence', details: error.message });
    }
});
// PUT update geofence
router.put('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { name, latitude, longitude, radius, punchRule } = req.body;
        const geofence = await prismaClient_1.default.geofence.update({
            where: { id: parseInt(id) },
            data: { name, latitude, longitude, radius, punchRule }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'GEOFENCE', name);
        res.json(geofence);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update geofence', details: error.message });
    }
});
// DELETE geofence
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const gf = await prismaClient_1.default.geofence.findUnique({ where: { id: parseInt(id) } });
        if (!gf)
            return res.status(404).json({ error: 'Geofence not found' });
        await prismaClient_1.default.geofence.delete({ where: { id: parseInt(id) } });
        await (0, activityLogger_1.logActivity)(null, 'DELETED', 'GEOFENCE', gf.name);
        res.json({ message: 'Geofence deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete geofence', details: error.message });
    }
});
// PATCH toggle status
router.patch('/:id/toggle', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const gf = await prismaClient_1.default.geofence.findUnique({ where: { id: parseInt(id) } });
        if (!gf)
            return res.status(404).json({ error: 'Geofence not found' });
        const updated = await prismaClient_1.default.geofence.update({
            where: { id: parseInt(id) },
            data: { status: gf.status === 'Active' ? 'Inactive' : 'Active' }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'GEOFENCE', `${gf.name} toggled to ${updated.status}`);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to toggle geofence', details: error.message });
    }
});
// GET export CSV
router.get('/export', authMiddleware_1.authenticateToken, async (_req, res) => {
    try {
        const geofences = await prismaClient_1.default.geofence.findMany({ orderBy: { createdAt: 'desc' } });
        const header = 'ID,Name,Latitude,Longitude,Radius (m),Status,Punch Rule,Employee Count,Created At\n';
        const rows = geofences.map(g => `${g.id},"${g.name}",${g.latitude},${g.longitude},${g.radius},${g.status},${g.punchRule},${g.employeeCount},${g.createdAt.toISOString()}`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=geofences.csv');
        res.send(header + rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export geofences', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=geofences.js.map