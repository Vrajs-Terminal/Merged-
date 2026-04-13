import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all discussions (Filtered by user targeting)
router.get('/', async (req, res) => {
    try {
        const { userId, role, branchId, deptId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const uId = Number(userId);
        const bId = branchId ? Number(branchId) : null;
        const dId = deptId ? Number(deptId) : null;

        let where: any = { status: { not: 'Deleted' } };

        // If not Admin, filter by targeting
        if (role !== 'Admin') {
            where = {
                AND: [
                    { status: 'Active' }, // Employees only see Active topics
                    {
                        OR: [
                            // 1. Discussions with NO targets (Global)
                            {
                                AND: [
                                    { targetsBranch: { none: {} } },
                                    { targetsDept: { none: {} } },
                                    { targetsUser: { none: {} } }
                                ]
                            },
                            // 2. Targeted to his Branch
                            { targetsBranch: { some: { branch_id: bId } } },
                            // 3. Targeted to his Department
                            { targetsDept: { some: { department_id: dId } } },
                            // 4. Targeted specifically to him
                            { targetsUser: { some: { user_id: uId } } }
                        ]
                    }
                ]
            };
        }

        const discussions = await prisma.discussion.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, role: true } },
                targetsBranch: { include: { branch: { select: { name: true } } } },
                targetsDept: { include: { department: { select: { name: true } } } },
                targetsUser: { include: { user: { select: { name: true } } } },
                _count: { select: { comments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(discussions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST Create Discussion
router.post('/', async (req, res) => {
    try {
        const { title, description, created_by, branchIds, deptIds, userIds, attachments } = req.body;

        if (!title || !created_by) {
            return res.status(400).json({ message: 'Title and Created By are required' });
        }

        const discussion = await prisma.discussion.create({
            data: {
                title,
                description,
                created_by: Number(created_by),
                status: 'Active',
                targetsBranch: {
                    create: (branchIds || []).map((id: number) => ({ branch_id: Number(id) }))
                },
                targetsDept: {
                    create: (deptIds || []).map((id: number) => ({ department_id: Number(id) }))
                },
                targetsUser: {
                    create: (userIds || []).map((id: number) => ({ user_id: Number(id) }))
                },
                attachments: {
                    create: (attachments || []).map((a: any) => ({
                        file_url: a.url,
                        file_name: a.name,
                        file_type: a.type
                    }))
                }
            }
        });

        res.status(201).json(discussion);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT Update Status/Info
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, title, description } = req.body;

        const updated = await prisma.discussion.update({
            where: { id: Number(id) },
            data: {
                status,
                title,
                description
            }
        });

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE Discussion (Soft Delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.discussion.update({
            where: { id: Number(id) },
            data: { status: 'Deleted' }
        });
        res.json({ message: 'Discussion deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
