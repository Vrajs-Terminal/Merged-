"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// React to Post (Like/Love/Celebrate/Insightful) - Submodule 5
router.post('/:id/react', authMiddleware_1.authenticateToken, async (req, res) => {
    const { reaction_type } = req.body;
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    try {
        const reaction = await prismaClient_1.default.timelineReaction.upsert({
            where: {
                post_id_user_id: {
                    post_id: postId,
                    user_id: userId
                }
            },
            update: { reaction_type },
            create: {
                post_id: postId,
                user_id: userId,
                reaction_type
            }
        });
        // Optional: Trigger notification for post author
        const post = await prismaClient_1.default.timelinePost.findUnique({ where: { id: postId } });
        if (post && post.author_id !== userId) {
            await prismaClient_1.default.timelineNotification.create({
                data: {
                    user_id: post.author_id,
                    type: 'Reaction',
                    title: 'New Reaction',
                    message: `${req.user.name || 'Someone'} reacted to your post.`,
                    reference_id: postId
                }
            });
        }
        res.json(reaction);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to react to post', details: error.message });
    }
});
// Remove Reaction (Unlike)
router.delete('/:id/react', authMiddleware_1.authenticateToken, async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    try {
        await prismaClient_1.default.timelineReaction.delete({
            where: {
                post_id_user_id: {
                    post_id: postId,
                    user_id: userId
                }
            }
        });
        res.json({ message: 'Reaction removed' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove reaction', details: error.message });
    }
});
// Get Comments for a Post (Nested Replies)
router.get('/:id/comments', authMiddleware_1.authenticateToken, async (req, res) => {
    const postId = parseInt(req.params.id);
    try {
        const comments = await prismaClient_1.default.timelineComment.findMany({
            where: { post_id: postId, parent_id: null }, // Fetch parent comments
            include: {
                user: { select: { id: true, name: true } },
                replies: {
                    include: { user: { select: { id: true, name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
    }
});
// Add Comment or Reply (Submodule 5)
router.post('/:id/comment', authMiddleware_1.authenticateToken, async (req, res) => {
    const { content, parent_id } = req.body;
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    try {
        const comment = await prismaClient_1.default.timelineComment.create({
            data: {
                post_id: postId,
                user_id: userId,
                parent_id: parent_id ? parseInt(parent_id) : null,
                content
            }
        });
        // Trigger Notification
        const post = await prismaClient_1.default.timelinePost.findUnique({ where: { id: postId } });
        if (post && post.author_id !== userId) {
            await prismaClient_1.default.timelineNotification.create({
                data: {
                    user_id: post.author_id,
                    type: 'Comment',
                    title: 'New Comment',
                    message: `${req.user.name || 'Someone'} commented on your post.`,
                    reference_id: postId
                }
            });
        }
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add comment', details: error.message });
    }
});
// Delete Comment
router.delete('/comment/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const comment = await prismaClient_1.default.timelineComment.findUnique({ where: { id } });
        if (!comment)
            return res.status(404).json({ error: 'Comment not found' });
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin';
        if (comment.user_id !== req.user.id && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await prismaClient_1.default.timelineComment.delete({ where: { id } });
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete comment', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=engagement.js.map