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
// GET all exceptions with filters
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { type, severity, status } = req.query;
        const whereClause = {};
        if (type && type !== 'All')
            whereClause.type = type;
        if (severity && severity !== 'All')
            whereClause.severity = severity;
        if (status && status !== 'All')
            whereClause.status = status;
        const exceptions = await prismaClient_1.default.trackingException.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true, name: true,
                        department: { select: { name: true } },
                        branch: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 200
        });
        // Stats
        const stats = {
            total: await prismaClient_1.default.trackingException.count({ where: whereClause }),
            pending: await prismaClient_1.default.trackingException.count({ where: { ...whereClause, status: 'Pending' } }),
            approved: await prismaClient_1.default.trackingException.count({ where: { ...whereClause, status: 'Approved' } }),
            rejected: await prismaClient_1.default.trackingException.count({ where: { ...whereClause, status: 'Rejected' } }),
        };
        // Type counts
        const typeCounts = {
            latePunch: await prismaClient_1.default.trackingException.count({ where: { type: 'Late Punch' } }),
            geofenceViolation: await prismaClient_1.default.trackingException.count({ where: { type: 'Geofence Violation' } }),
            gpsOff: await prismaClient_1.default.trackingException.count({ where: { type: 'GPS Off' } }),
            internetOff: await prismaClient_1.default.trackingException.count({ where: { type: 'Internet Off' } }),
            unauthorized: await prismaClient_1.default.trackingException.count({ where: { type: 'Unauthorized Movement' } }),
        };
        res.json({ exceptions, stats, typeCounts });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch exceptions', details: error.message });
    }
});
// PATCH approve exception
router.patch('/:id/approve', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const exception = await prismaClient_1.default.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Approved', resolvedAt: new Date() }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'TRACKING_EXCEPTION', `Approved exception #${id}`);
        res.json(exception);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to approve exception', details: error.message });
    }
});
// PATCH reject exception
router.patch('/:id/reject', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const exception = await prismaClient_1.default.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Rejected', resolvedAt: new Date() }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'TRACKING_EXCEPTION', `Rejected exception #${id}`);
        res.json(exception);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reject exception', details: error.message });
    }
});
// PATCH ask reason
router.patch('/:id/ask-reason', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const exception = await prismaClient_1.default.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Asked Reason' }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'TRACKING_EXCEPTION', `Asked reason for exception #${id}`);
        res.json(exception);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update exception', details: error.message });
    }
});
// GET export CSV
router.get('/export', authMiddleware_1.authenticateToken, async (_req, res) => {
    try {
        const exceptions = await prismaClient_1.default.trackingException.findMany({
            include: { user: { select: { name: true, department: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
        const header = 'ID,Employee,Department,Type,Severity,Status,Description,Reason,Created At,Resolved At\n';
        const rows = exceptions.map(e => { var _a, _b; return `${e.id},"${e.user.name}","${((_a = e.user.department) === null || _a === void 0 ? void 0 : _a.name) || ''}","${e.type}",${e.severity},${e.status},"${e.description || ''}","${e.reason || ''}",${e.createdAt.toISOString()},${((_b = e.resolvedAt) === null || _b === void 0 ? void 0 : _b.toISOString()) || ''}`; }).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tracking_exceptions.csv');
        res.send(header + rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export exceptions', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=tracking-exceptions.js.map