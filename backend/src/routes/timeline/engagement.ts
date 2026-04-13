import { Router } from 'express';
import prisma from '../../lib/prismaClient';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

// React to Post (Like/Love/Celebrate/Insightful) - Submodule 5
router.post('/:id/react', authenticateToken, async (req, res) => {
    const { reaction_type } = req.body;
    const postId = parseInt(req.params.id);
    const userId = (req as any).user.id;

    try {
        const reaction = await prisma.timelineReaction.upsert({
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
        const post = await prisma.timelinePost.findUnique({ where: { id: postId } });
        if (post && post.author_id !== userId) {
            await prisma.timelineNotification.create({
                data: {
                    user_id: post.author_id,
                    type: 'Reaction',
                    title: 'New Reaction',
                    message: `${(req as any).user.name || 'Someone'} reacted to your post.`,
                    reference_id: postId
                }
            });
        }

        res.json(reaction);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to react to post', details: error.message });
    }
});

// Remove Reaction (Unlike)
router.delete('/:id/react', authenticateToken, async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = (req as any).user.id;

    try {
        await prisma.timelineReaction.delete({
            where: {
                post_id_user_id: {
                    post_id: postId,
                    user_id: userId
                }
            }
        });
        res.json({ message: 'Reaction removed' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to remove reaction', details: error.message });
    }
});

// Get Comments for a Post (Nested Replies)
router.get('/:id/comments', authenticateToken, async (req, res) => {
    const postId = parseInt(req.params.id);

    try {
        const comments = await prisma.timelineComment.findMany({
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
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
    }
});

// Add Comment or Reply (Submodule 5)
router.post('/:id/comment', authenticateToken, async (req, res) => {
    const { content, parent_id } = req.body;
    const postId = parseInt(req.params.id);
    const userId = (req as any).user.id;

    try {
        const comment = await prisma.timelineComment.create({
            data: {
                post_id: postId,
                user_id: userId,
                parent_id: parent_id ? parseInt(parent_id) : null,
                content
            }
        });

        // Trigger Notification
        const post = await prisma.timelinePost.findUnique({ where: { id: postId } });
        if (post && post.author_id !== userId) {
            await prisma.timelineNotification.create({
                data: {
                    user_id: post.author_id,
                    type: 'Comment',
                    title: 'New Comment',
                    message: `${((req as any).user.name as string) || 'Someone'} commented on your post.`,
                    reference_id: postId
                }
            });
        }

        res.status(201).json(comment);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to add comment', details: error.message });
    }
});

// Delete Comment
router.delete('/comment/:id', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const comment = await prisma.timelineComment.findUnique({ where: { id } });

        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const isAdmin = (req as any).user.role === 'Admin' || (req as any).user.role === 'SuperAdmin';
        if (comment.user_id !== (req as any).user.id && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.timelineComment.delete({ where: { id } });
        res.json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete comment', details: error.message });
    }
});

export default router;
