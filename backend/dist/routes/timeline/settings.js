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
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Module Status (Self-Health check)
router.get('/status', (req, res) => {
    res.json({ status: 'ok', name: 'Timeline Module', modules: 8 });
});
// Timeline Settings (Submodule 8)
router.get('/settings', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prismaClient_1.default.timelineSetting.findMany();
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
}));
router.post('/settings', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const { key, value } = req.body;
    try {
        const updated = yield prismaClient_1.default.timelineSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
}));
// Notifications (Submodule 6)
router.get('/notifications', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifs = yield prismaClient_1.default.timelineNotification.findMany({
            where: { user_id: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
}));
// Analytical Reports (Submodule 7)
router.get('/reports', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalPosts = yield prismaClient_1.default.timelinePost.count();
        const totalReactions = yield prismaClient_1.default.timelineReaction.count();
        const totalComments = yield prismaClient_1.default.timelineComment.count();
        // Engagement rate (simple)
        const engagement = {
            total: totalReactions + totalComments,
            rate: totalPosts > 0 ? (totalReactions + totalComments) / totalPosts : 0
        };
        const topAuthors = yield prismaClient_1.default.timelinePost.groupBy({
            by: ['author_id'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });
        res.json({
            stats: { totalPosts, totalReactions, totalComments, engagement },
            topAuthors
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
}));
exports.default = router;
