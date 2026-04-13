import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

/**
 * GET all holiday groups
 */
router.get('/', async (req, res) => {
    try {
        const groups = await prisma.holidayGroup.findMany({
            include: {
                _count: {
                    select: { holidays: true }
                }
            }
        });
        res.json(groups);
    } catch (err) {
        console.error('Fetch Holiday Groups Error:', err);
        res.status(500).json({ error: 'Failed to fetch holiday groups' });
    }
});

/**
 * POST create a new holiday group
 */
router.post('/', async (req, res) => {
    try {
        const { name, description, holidayIds } = req.body;

        if (!name) return res.status(400).json({ error: 'Group Name is required' });

        const group = await prisma.holidayGroup.create({
            data: {
                name,
                description,
                holidays: {
                    create: (holidayIds || []).map((id: number) => ({
                        holiday: { connect: { id } }
                    }))
                }
            }
        });

        res.status(201).json(group);
    } catch (err) {
        console.error('Create Holiday Group Error:', err);
        res.status(500).json({ error: 'Failed to create holiday group' });
    }
});

/**
 * DELETE a holiday group
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.holidayGroup.delete({ where: { id } });
        res.json({ message: 'Holiday group deleted successfully' });
    } catch (err) {
        console.error('Delete Holiday Group Error:', err);
        res.status(500).json({ error: 'Failed to delete holiday group' });
    }
});

/**
 * GET all group assignments
 */
router.get('/assignments', async (req, res) => {
    try {
        const assignments = await prisma.holidayGroupAssignment.findMany({
            include: {
                group: true,
                user: { select: { id: true, name: true, branch: { select: { name: true } }, department: { select: { name: true } } } },
                department: { select: { id: true, name: true, branch: { select: { name: true } } } }
            }
        });
        res.json(assignments);
    } catch (err) {
        console.error('Fetch Assignments Error:', err);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

/**
 * POST assign group to user or department
 */
router.post('/assign', async (req, res) => {
    try {
        const { groupId, userId, departmentId } = req.body;

        if (!groupId || (!userId && !departmentId)) {
            return res.status(400).json({ error: 'Group ID and either User ID or Department ID are required' });
        }

        const assignment = await prisma.holidayGroupAssignment.create({
            data: {
                groupId: Number(groupId),
                userId: userId ? Number(userId) : null,
                departmentId: departmentId ? Number(departmentId) : null
            }
        });

        res.status(201).json(assignment);
    } catch (err) {
        console.error('Assign Holiday Group Error:', err);
        res.status(500).json({ error: 'Failed to assign holiday group' });
    }
});

/**
 * DELETE an assignment
 */
router.delete('/assignments/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.holidayGroupAssignment.delete({ where: { id } });
        res.json({ message: 'Assignment removed successfully' });
    } catch (err) {
        console.error('Remove Assignment Error:', err);
        res.status(500).json({ error: 'Failed to remove assignment' });
    }
});

export default router;
