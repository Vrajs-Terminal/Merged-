import { Router } from 'express';
import prisma from '../../lib/prismaClient';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

// 1. Fetch Timeline Posts (Submodule 4 & 5)
// Supports filtering by audience (All, Branch, Department)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: (req as any).user.id },
            include: { branch: true, department: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';

        // Audience Logic: 
        // - Admins see everything.
        // - Employees see: All, their Branch, or their Department posts.
        const posts = await prisma.timelinePost.findMany({
            where: isAdmin ? {} : {
                status: 'Approved',
                OR: [
                    { audience_type: 'All' },
                    { 
                        audience_type: 'Branch',
                        audience_id: (user.branch_id as number) || undefined
                    },
                    {
                        audience_type: 'Department',
                        audience_id: (user.department_id as number) || undefined
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
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
    }
});

// 2. Create Post (Submodule 1)
router.post('/', authenticateToken, async (req, res) => {
    const { type, content, media_url, audience_type, audience_id, visibility, scheduled_at } = req.body;
    const author_id = (req as any).user.id;

    try {
        // Automatic Approval: Employees might need approval, Admins are pre-approved.
        // For now, setting all to Approved unless specific 'Settings' logic added.
        const post = await prisma.timelinePost.create({
            data: {
                author_id,
                type: type as string,
                content: content as string,
                media_url: media_url as string,
                audience_type: (audience_type as string) || 'All',
                audience_id: audience_id ? parseInt(audience_id as string) : null,
                visibility: (visibility as string) || 'Public',
                scheduled_at: scheduled_at ? new Date(scheduled_at as string) : null,
                status: 'Approved' 
            },
            include: {
                author: { select: { name: true } }
            }
        });

        res.status(201).json(post);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create post', details: error.message });
    }
});

// 3. Delete Post
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const post = await prisma.timelinePost.findUnique({ where: { id: postId } });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        const isAdmin = (req as any).user.role === 'Admin' || (req as any).user.role === 'SuperAdmin';
        if (post.author_id !== (req as any).user.id && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.timelinePost.delete({ where: { id: postId } });
        res.json({ message: 'Post deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete post', details: error.message });
    }
});

// 4. Update Post Status (Moderation - Submodule 4)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body;
    if ((req as any).user.role !== 'Admin' && (req as any).user.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Only admins can moderate posts' });
    }

    try {
        const updated = await prisma.timelinePost.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update post status', details: error.message });
    }
});

export default router;
