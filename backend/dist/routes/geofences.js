"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
router.get('/', authMiddleware_1.authenticateToken, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const geofences = yield prismaClient_1.default.geofence.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(geofences);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch geofences', details: error.message });
    }
}));
// POST create geofence
router.post('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, latitude, longitude, radius, punchRule } = req.body;
        if (!name || !latitude || !longitude) {
            return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
        }
        const geofence = yield prismaClient_1.default.geofence.create({
            data: {
                name,
                latitude,
                longitude,
                radius: radius || 200,
                punchRule: punchRule || 'inside_only'
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'GEOFENCE', name);
        res.status(201).json(geofence);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create geofence', details: error.message });
    }
}));
// PUT update geofence
router.put('/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { name, latitude, longitude, radius, punchRule } = req.body;
        const geofence = yield prismaClient_1.default.geofence.update({
            where: { id: parseInt(id) },
            data: { name, latitude, longitude, radius, punchRule }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'GEOFENCE', name);
        res.json(geofence);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update geofence', details: error.message });
    }
}));
// DELETE geofence
router.delete('/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const gf = yield prismaClient_1.default.geofence.findUnique({ where: { id: parseInt(id) } });
        if (!gf)
            return res.status(404).json({ error: 'Geofence not found' });
        yield prismaClient_1.default.geofence.delete({ where: { id: parseInt(id) } });
        yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'GEOFENCE', gf.name);
        res.json({ message: 'Geofence deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete geofence', details: error.message });
    }
}));
// PATCH toggle status
router.patch('/:id/toggle', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const gf = yield prismaClient_1.default.geofence.findUnique({ where: { id: parseInt(id) } });
        if (!gf)
            return res.status(404).json({ error: 'Geofence not found' });
        const updated = yield prismaClient_1.default.geofence.update({
            where: { id: parseInt(id) },
            data: { status: gf.status === 'Active' ? 'Inactive' : 'Active' }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'GEOFENCE', `${gf.name} toggled to ${updated.status}`);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to toggle geofence', details: error.message });
    }
}));
// GET export CSV
router.get('/export', authMiddleware_1.authenticateToken, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const geofences = yield prismaClient_1.default.geofence.findMany({ orderBy: { createdAt: 'desc' } });
        const header = 'ID,Name,Latitude,Longitude,Radius (m),Status,Punch Rule,Employee Count,Created At\n';
        const rows = geofences.map(g => `${g.id},"${g.name}",${g.latitude},${g.longitude},${g.radius},${g.status},${g.punchRule},${g.employeeCount},${g.createdAt.toISOString()}`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=geofences.csv');
        res.send(header + rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export geofences', details: error.message });
    }
}));
exports.default = router;
