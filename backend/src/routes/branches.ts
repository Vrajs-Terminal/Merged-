import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { optionalAuthenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();


// Get all branches
router.get('/', optionalAuthenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        let whereClause = {};

        // Apply branch data silo restrictions if not empty
        if (user && user.role === 'Admin' && user.restrictedBranchIds && user.restrictedBranchIds.length > 0) {
            whereClause = { id: { in: user.restrictedBranchIds } };
        }

        const branches = await prisma.branch.findMany({
            where: whereClause,
            orderBy: { order_index: 'asc' },
            include: { departments: true }
        });
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
});

// Create a new branch
router.post('/', async (req, res) => {
    const { name, code, type } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        let finalCode = code;
        if (!finalCode) {
            // Generate a random unique code if not provided
            finalCode = `BR-${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
        }

        const existingBranch = await prisma.branch.findUnique({ where: { code: finalCode } });
        if (existingBranch) {
            return res.status(400).json({ error: 'Branch code already exists' });
        }

        const maxOrder = await prisma.branch.aggregate({
            _max: { order_index: true }
        });
        const nextOrder = (maxOrder._max.order_index || 0) + 1;

        const branch = await prisma.branch.create({
            data: {
                name,
                code: finalCode,
                type: type || 'Metro',
                order_index: nextOrder
            },
            include: { departments: true }
        });
        const user = (req as any).user;
        await logActivity(user?.id || null, 'CREATED', 'BRANCH', branch.name, { code: branch.code, type: branch.type });
        res.status(201).json(branch);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create branch' });
    }
});

// Delete a branch
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if it has departments
        const branch = await prisma.branch.findUnique({
            where: { id: parseInt(id) },
            include: { departments: true }
        });

        if (!branch) return res.status(404).json({ error: 'Branch not found' });
        if (branch.departments.length > 0) {
            return res.status(400).json({ error: 'Cannot delete branch with active departments' });
        }

        const user = (req as any).user;
        await prisma.branch.delete({ where: { id: parseInt(id) } });
        await logActivity(user?.id || null, 'DELETED', 'BRANCH', branch.name);
        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete branch' });
    }
});

// Bulk Import Branches
router.post('/bulk', async (req, res) => {
    const { branches } = req.body;

    if (!branches || !Array.isArray(branches)) {
        return res.status(400).json({ error: 'Invalid branches data' });
    }

    try {
        const results = await prisma.$transaction(async (tx) => {
            let count = 0;
            for (const b of branches) {
                // Skip if name is missing
                if (!b.name) continue;

                let finalCode = b.code;
                if (!finalCode) {
                    finalCode = `BR-${b.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
                }

                // Check for existing code in DB
                const existing = await tx.branch.findUnique({ where: { code: finalCode } });
                if (existing) continue;

                await tx.branch.create({
                    data: {
                        name: b.name,
                        code: finalCode,
                        type: b.type || 'Metro',
                        order_index: 0 // Will need re-ordering
                    }
                });
                count++;
            }
            return { count };
        });

        const user = (req as any).user;
        await logActivity(user?.id || null, 'BULK_IMPORT', 'BRANCH', `Imported ${results.count} branches`);
        res.json(results);
    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ error: 'Failed to bulk import branches' });
    }
});

export default router;
