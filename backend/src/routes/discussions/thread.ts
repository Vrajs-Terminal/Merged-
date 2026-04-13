import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET Threaded Comments for a Discussion
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await prisma.discussionComment.findMany({
            where: { discussion_id: Number(id) },
            include: {
                user: { select: { id: true, name: true, role: true } },
                reactions: { 
                    select: { user_id: true, reaction: true }
                },
                replies: {
                    include: {
                        user: { select: { id: true, name: true, role: true } },
                        reactions: { select: { user_id: true, reaction: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Hierarchy logic: Top-level comments only (replies are nested)
        const topLevel = comments.filter(c => !c.parent_id);
        res.json(topLevel);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST Add Comment / Reply
router.post('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, comment, parent_id, attachments } = req.body;

        if (!user_id || !comment) {
            return res.status(400).json({ message: 'User ID and Comment text are required' });
        }

        const newComment = await prisma.discussionComment.create({
            data: {
                discussion_id: Number(id),
                user_id: Number(user_id),
                comment,
                parent_id: parent_id ? Number(parent_id) : null,
                attachments: {
                    create: (attachments || []).map((a: any) => ({
                        file_url: a.url,
                        file_name: a.name,
                        file_type: a.type
                    }))
                }
            },
            include: {
                user: { select: { id: true, name: true, role: true } },
                attachments: true
            }
        });

        res.status(201).json(newComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST React (Toggle Like/Emoji)
router.post('/comments/:id/react', async (req, res) => {
    try {
        const { id } = req.params; // Comment ID
        const { user_id, reaction } = req.body;

        if (!user_id || !reaction) {
            return res.status(400).json({ message: 'User ID and Reaction are required' });
        }

        const uId = Number(user_id);
        const cId = Number(id);

        // Check if reaction already exists
        const existing = await prisma.discussionReaction.findFirst({
            where: { comment_id: cId, user_id: uId, reaction }
        });

        if (existing) {
            // Un-react (Delete)
            await prisma.discussionReaction.delete({ where: { id: existing.id } });
            return res.json({ message: 'Reaction removed', active: false });
        } else {
            // Add reaction
            await prisma.discussionReaction.create({
                data: { comment_id: cId, user_id: uId, reaction }
            });
            return res.status(201).json({ message: 'Reaction added', active: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
