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
// GET all exceptions with filters
router.get('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, severity, status } = req.query;
        const whereClause = {};
        if (type && type !== 'All')
            whereClause.type = type;
        if (severity && severity !== 'All')
            whereClause.severity = severity;
        if (status && status !== 'All')
            whereClause.status = status;
        const exceptions = yield prismaClient_1.default.trackingException.findMany({
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
            total: yield prismaClient_1.default.trackingException.count({ where: whereClause }),
            pending: yield prismaClient_1.default.trackingException.count({ where: Object.assign(Object.assign({}, whereClause), { status: 'Pending' }) }),
            approved: yield prismaClient_1.default.trackingException.count({ where: Object.assign(Object.assign({}, whereClause), { status: 'Approved' }) }),
            rejected: yield prismaClient_1.default.trackingException.count({ where: Object.assign(Object.assign({}, whereClause), { status: 'Rejected' }) }),
        };
        // Type counts
        const typeCounts = {
            latePunch: yield prismaClient_1.default.trackingException.count({ where: { type: 'Late Punch' } }),
            geofenceViolation: yield prismaClient_1.default.trackingException.count({ where: { type: 'Geofence Violation' } }),
            gpsOff: yield prismaClient_1.default.trackingException.count({ where: { type: 'GPS Off' } }),
            internetOff: yield prismaClient_1.default.trackingException.count({ where: { type: 'Internet Off' } }),
            unauthorized: yield prismaClient_1.default.trackingException.count({ where: { type: 'Unauthorized Movement' } }),
        };
        res.json({ exceptions, stats, typeCounts });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch exceptions', details: error.message });
    }
}));
// PATCH approve exception
router.patch('/:id/approve', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const exception = yield prismaClient_1.default.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Approved', resolvedAt: new Date() }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'TRACKING_EXCEPTION', `Approved exception #${id}`);
        res.json(exception);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to approve exception', details: error.message });
    }
}));
// PATCH reject exception
router.patch('/:id/reject', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const exception = yield prismaClient_1.default.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Rejected', resolvedAt: new Date() }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'TRACKING_EXCEPTION', `Rejected exception #${id}`);
        res.json(exception);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reject exception', details: error.message });
    }
}));
// PATCH ask reason
router.patch('/:id/ask-reason', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const exception = yield prismaClient_1.default.trackingException.update({
            where: { id: parseInt(id) },
            data: { status: 'Asked Reason' }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'TRACKING_EXCEPTION', `Asked reason for exception #${id}`);
        res.json(exception);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update exception', details: error.message });
    }
}));
// GET export CSV
router.get('/export', authMiddleware_1.authenticateToken, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exceptions = yield prismaClient_1.default.trackingException.findMany({
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
}));
exports.default = router;
