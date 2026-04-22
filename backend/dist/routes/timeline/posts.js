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
// 1. Fetch Timeline Posts (Submodule 4 & 5)
// Supports filtering by audience (All, Branch, Department)
router.get('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: req.user.id },
            include: { branch: true, department: true }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';
        // Audience Logic: 
        // - Admins see everything.
        // - Employees see: All, their Branch, or their Department posts.
        const posts = yield prismaClient_1.default.timelinePost.findMany({
            where: isAdmin ? {} : {
                status: 'Approved',
                OR: [
                    { audience_type: 'All' },
                    {
                        audience_type: 'Branch',
                        audience_id: user.branch_id || undefined
                    },
                    {
                        audience_type: 'Department',
                        audience_id: user.department_id || undefined
                    }
                ]
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true, role: true }
                },
                reactions: {
                    include: { user: { select: { id: true, name: true } } }
                },
                _count: {
                    select: { reactions: true, comments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
    }
}));
// 2. Create Post (Submodule 1)
router.post('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, content, media_url, audience_type, audience_id, visibility, scheduled_at } = req.body;
    const author_id = req.user.id;
    try {
        // Automatic Approval: Employees might need approval, Admins are pre-approved.
        // For now, setting all to Approved unless specific 'Settings' logic added.
        const post = yield prismaClient_1.default.timelinePost.create({
            data: {
                author_id,
                type: type,
                content: content,
                media_url: media_url,
                audience_type: audience_type || 'All',
                audience_id: audience_id ? parseInt(audience_id) : null,
                visibility: visibility || 'Public',
                scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
                status: 'Approved'
            },
            include: {
                author: { select: { name: true } }
            }
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create post', details: error.message });
    }
}));
// 3. Delete Post
router.delete('/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = parseInt(req.params.id);
        const post = yield prismaClient_1.default.timelinePost.findUnique({ where: { id: postId } });
        if (!post)
            return res.status(404).json({ error: 'Post not found' });
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin';
        if (post.author_id !== req.user.id && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        yield prismaClient_1.default.timelinePost.delete({ where: { id: postId } });
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete post', details: error.message });
    }
}));
// 4. Update Post Status (Moderation - Submodule 4)
router.patch('/:id/status', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Only admins can moderate posts' });
    }
    try {
        const updated = yield prismaClient_1.default.timelinePost.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update post status', details: error.message });
    }
}));
exports.default = router;
