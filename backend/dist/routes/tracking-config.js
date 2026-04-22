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
// GET all tracking configs with user info
router.get('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, department } = req.query;
        const userWhere = {};
        if (search)
            userWhere.name = { contains: search };
        if (department && department !== 'All Departments') {
            userWhere.department = { name: department };
        }
        const users = yield prismaClient_1.default.user.findMany({
            where: userWhere,
            select: {
                id: true, name: true, email: true,
                department: { select: { name: true } },
                branch: { select: { name: true } },
                trackingConfig: true
            },
            orderBy: { name: 'asc' }
        });
        const configs = users.map(u => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return ({
                userId: u.id,
                name: u.name,
                email: u.email,
                department: ((_a = u.department) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                branch: ((_b = u.branch) === null || _b === void 0 ? void 0 : _b.name) || 'N/A',
                enabled: (_d = (_c = u.trackingConfig) === null || _c === void 0 ? void 0 : _c.enabled) !== null && _d !== void 0 ? _d : false,
                frequency: (_f = (_e = u.trackingConfig) === null || _e === void 0 ? void 0 : _e.frequency) !== null && _f !== void 0 ? _f : 15,
                workingHoursOnly: (_h = (_g = u.trackingConfig) === null || _g === void 0 ? void 0 : _g.workingHoursOnly) !== null && _h !== void 0 ? _h : true,
                configId: ((_j = u.trackingConfig) === null || _j === void 0 ? void 0 : _j.id) || null
            });
        });
        const stats = {
            total: configs.length,
            enabled: configs.filter(c => c.enabled).length,
            disabled: configs.filter(c => !c.enabled).length
        };
        res.json({ configs, stats });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tracking configs', details: error.message });
    }
}));
// PATCH update individual config
router.patch('/:userId', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.userId);
        const { enabled, frequency, workingHoursOnly } = req.body;
        const config = yield prismaClient_1.default.trackingConfig.upsert({
            where: { user_id: userId },
            update: { enabled, frequency, workingHoursOnly },
            create: {
                user_id: userId,
                enabled: enabled !== null && enabled !== void 0 ? enabled : true,
                frequency: frequency !== null && frequency !== void 0 ? frequency : 15,
                workingHoursOnly: workingHoursOnly !== null && workingHoursOnly !== void 0 ? workingHoursOnly : true
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'TRACKING_CONFIG', `Updated tracking config for user #${userId}`);
        res.json(config);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update tracking config', details: error.message });
    }
}));
// POST bulk enable/disable
router.post('/bulk', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userIds, enabled } = req.body;
        if (!Array.isArray(userIds)) {
            return res.status(400).json({ error: 'userIds must be an array' });
        }
        const results = [];
        for (const userId of userIds) {
            const config = yield prismaClient_1.default.trackingConfig.upsert({
                where: { user_id: userId },
                update: { enabled },
                create: { user_id: userId, enabled }
            });
            results.push(config);
        }
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'TRACKING_CONFIG', `Bulk ${enabled ? 'enabled' : 'disabled'} ${userIds.length} users`);
        res.json({ message: `Updated ${results.length} configs`, results });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to bulk update configs', details: error.message });
    }
}));
// GET export CSV
router.get('/export', authMiddleware_1.authenticateToken, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prismaClient_1.default.user.findMany({
            select: {
                id: true, name: true,
                department: { select: { name: true } },
                branch: { select: { name: true } },
                trackingConfig: true
            },
            orderBy: { name: 'asc' }
        });
        const header = 'User ID,Name,Department,Branch,Tracking Enabled,Frequency (min),Working Hours Only\n';
        const rows = users.map(u => { var _a, _b, _c, _d, _e, _f, _g, _h; return `${u.id},"${u.name}","${((_a = u.department) === null || _a === void 0 ? void 0 : _a.name) || ''}","${((_b = u.branch) === null || _b === void 0 ? void 0 : _b.name) || ''}",${(_d = (_c = u.trackingConfig) === null || _c === void 0 ? void 0 : _c.enabled) !== null && _d !== void 0 ? _d : false},${(_f = (_e = u.trackingConfig) === null || _e === void 0 ? void 0 : _e.frequency) !== null && _f !== void 0 ? _f : 15},${(_h = (_g = u.trackingConfig) === null || _g === void 0 ? void 0 : _g.workingHoursOnly) !== null && _h !== void 0 ? _h : true}`; }).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tracking_configs.csv');
        res.send(header + rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export configs', details: error.message });
    }
}));
exports.default = router;
