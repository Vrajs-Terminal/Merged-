import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

// GET all geofences
router.get('/', authenticateToken, async (_req, res) => {
    try {
        const geofences = await prisma.geofence.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(geofences);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch geofences', details: error.message });
    }
});

// POST create geofence
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, latitude, longitude, radius, punchRule } = req.body;
        if (!name || !latitude || !longitude) {
            return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
        }
        const geofence = await prisma.geofence.create({
            data: {
                name,
                latitude,
                longitude,
                radius: radius || 200,
                punchRule: punchRule || 'inside_only'
            }
        });
        await logActivity(null, 'CREATED', 'GEOFENCE', name);
        res.status(201).json(geofence);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create geofence', details: error.message });
    }
});

// PUT update geofence
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id as string;
        const { name, latitude, longitude, radius, punchRule } = req.body;
        const geofence = await prisma.geofence.update({
            where: { id: parseInt(id) },
            data: { name, latitude, longitude, radius, punchRule }
        });
        await logActivity(null, 'UPDATED', 'GEOFENCE', name);
        res.json(geofence);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update geofence', details: error.message });
    }
});

// DELETE geofence
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id as string;
        const gf = await prisma.geofence.findUnique({ where: { id: parseInt(id) } });
        if (!gf) return res.status(404).json({ error: 'Geofence not found' });
        await prisma.geofence.delete({ where: { id: parseInt(id) } });
        await logActivity(null, 'DELETED', 'GEOFENCE', gf.name);
        res.json({ message: 'Geofence deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete geofence', details: error.message });
    }
});

// PATCH toggle status
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id as string;
        const gf = await prisma.geofence.findUnique({ where: { id: parseInt(id) } });
        if (!gf) return res.status(404).json({ error: 'Geofence not found' });
        const updated = await prisma.geofence.update({
            where: { id: parseInt(id) },
            data: { status: gf.status === 'Active' ? 'Inactive' : 'Active' }
        });
        await logActivity(null, 'UPDATED', 'GEOFENCE', `${gf.name} toggled to ${updated.status}`);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to toggle geofence', details: error.message });
    }
});

// GET export CSV
router.get('/export', authenticateToken, async (_req, res) => {
    try {
        const geofences = await prisma.geofence.findMany({ orderBy: { createdAt: 'desc' } });
        const header = 'ID,Name,Latitude,Longitude,Radius (m),Status,Punch Rule,Employee Count,Created At\n';
        const rows = geofences.map(g =>
            `${g.id},"${g.name}",${g.latitude},${g.longitude},${g.radius},${g.status},${g.punchRule},${g.employeeCount},${g.createdAt.toISOString()}`
        ).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=geofences.csv');
        res.send(header + rows);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to export geofences', details: error.message });
    }
});

export default router;
