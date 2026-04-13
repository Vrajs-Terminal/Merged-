import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = Router();

// Get all employee levels structured as flat list (for dropdowns / tables)
router.get('/', async (req, res) => {
    try {
        const levels = await prisma.employeeLevel.findMany({
            include: { parent: true },
            orderBy: [{ parent_id: 'asc' }, { order_index: 'asc' }]
        });
        res.json(levels);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee levels' });
    }
});

// Build a hierarchy tree recursively
// Helper function to build tree
const buildTree = (levels: any[], parentId: number | null = null): any[] => {
    return levels
        .filter(level => level.parent_id === parentId)
        .sort((a, b) => a.order_index - b.order_index)
        .map(level => ({
            ...level,
            children: buildTree(levels, level.id)
        }));
};

// Get Employee hierarchy tree
router.get('/hierarchy', async (req, res) => {
    try {
        const levels = await prisma.employeeLevel.findMany({
            orderBy: { order_index: 'asc' }
        });
        const tree = buildTree(levels);
        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: 'Failed to build hierarchy' });
    }
});

// Create Employee Level
router.post('/', async (req, res) => {
    const { name, parent_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        const maxOrder = await prisma.employeeLevel.aggregate({
            where: { parent_id: parent_id || null },
            _max: { order_index: true }
        });
        const newOrder = (maxOrder._max.order_index ?? 0) + 1;

        const level = await prisma.employeeLevel.create({
            data: {
                name,
                parent_id: parent_id || null,
                order_index: newOrder
            },
            include: { parent: true }
        });
        await logActivity(null, 'CREATED', 'EMPLOYEE_LEVEL', level.name);
        res.status(201).json(level);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create level' });
    }
});

// Prevent circular dependency helper
const isCircular = async (targetId: number, proposedParentId: number | null): Promise<boolean> => {
    if (!proposedParentId) return false;
    if (targetId === proposedParentId) return true;

    let currentParent = await prisma.employeeLevel.findUnique({ where: { id: proposedParentId } });
    while (currentParent?.parent_id) {
        if (currentParent.parent_id === targetId) return true;
        currentParent = await prisma.employeeLevel.findUnique({ where: { id: currentParent.parent_id } });
    }
    return false;
};

// Update Employee Level
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, parent_id } = req.body;

    try {
        if (parent_id) {
            const circular = await isCircular(Number(id), Number(parent_id));
            if (circular) {
                return res.status(400).json({ error: 'Circular hierarchy loop detected. A level cannot be a child of its own children.' });
            }
        }

        const level = await prisma.employeeLevel.update({
            where: { id: Number(id) },
            data: { name, parent_id: parent_id || null },
            include: { parent: true }
        });
        await logActivity(null, 'UPDATED', 'EMPLOYEE_LEVEL', level.name);
        res.json(level);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update level' });
    }
});

// Delete Employee Level
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const children = await prisma.employeeLevel.count({ where: { parent_id: Number(id) } });
        if (children > 0) {
            return res.status(400).json({ error: 'Cannot delete level because it has child levels. Please reassign or delete children first.' });
        }

        await prisma.employeeLevel.delete({ where: { id: Number(id) } });
        await logActivity(null, 'DELETED', 'EMPLOYEE_LEVEL', `Level #${id}`);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete level' });
    }
});

export default router;
