import express from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = express.Router();

// GET / — List all earning/deduction types (with optional type filter)
router.get('/', async (req, res) => {
    try {
        const { type, status } = req.query;
        const where: Record<string, string> = {};
        if (type && (type === 'Earning' || type === 'Deduction')) {
            where.type = type as string;
        }
        if (status && (status === 'Active' || status === 'Inactive')) {
            where.status = status as string;
        }

        const items = await prisma.earningDeductionType.findMany({
            where,
            orderBy: [{ type: 'asc' }, { name: 'asc' }]
        });

        res.json(items);
    } catch (error) {
        console.error("Error fetching earning/deduction types:", error);
        res.status(500).json({ error: "Failed to fetch earning/deduction types" });
    }
});

// GET /:id — Get single earning/deduction type
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const item = await prisma.earningDeductionType.findUnique({
            where: { id: parseInt(id) }
        });

        if (!item) {
            return res.status(404).json({ error: "Component not found" });
        }

        res.json(item);
    } catch (error) {
        console.error("Error fetching component:", error);
        res.status(500).json({ error: "Failed to fetch component" });
    }
});

// POST / — Create new earning/deduction type
router.post('/', async (req, res) => {
    try {
        const { name, type, taxable, description, status } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: "Name and Type are required" });
        }

        if (type !== 'Earning' && type !== 'Deduction') {
            return res.status(400).json({ error: "Type must be 'Earning' or 'Deduction'" });
        }

        const existing = await prisma.earningDeductionType.findUnique({
            where: { name }
        });

        if (existing) {
            return res.status(409).json({ error: `Component '${name}' already exists` });
        }

        const item = await prisma.earningDeductionType.create({
            data: {
                name,
                type,
                taxable: taxable === true || taxable === 'true',
                description: description || null,
                status: status || 'Active'
            }
        });

        await logActivity(null, 'CREATED', 'EARNING_DEDUCTION_TYPE', name);
        res.status(201).json(item);
    } catch (error) {
        console.error("Error creating component:", error);
        res.status(500).json({ error: "Failed to create component" });
    }
});

// PUT /:id — Update earning/deduction type
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, taxable, description, status } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: "Name and Type are required" });
        }

        // Check for duplicate name (exclude self)
        const existing = await prisma.earningDeductionType.findFirst({
            where: {
                name,
                NOT: { id: parseInt(id) }
            }
        });

        if (existing) {
            return res.status(409).json({ error: `Component '${name}' already exists` });
        }

        const item = await prisma.earningDeductionType.update({
            where: { id: parseInt(id) },
            data: {
                name,
                type,
                taxable: taxable === true || taxable === 'true',
                description: description || null,
                status: status || 'Active'
            }
        });

        await logActivity(null, 'UPDATED', 'EARNING_DEDUCTION_TYPE', name);
        res.json(item);
    } catch (error) {
        console.error("Error updating component:", error);
        res.status(500).json({ error: "Failed to update component" });
    }
});

// DELETE /:id — Delete earning/deduction type
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if used in any salary group
        const usageCount = await prisma.salaryGroupComponent.count({
            where: { earning_deduction_type_id: parseInt(id) }
        });

        if (usageCount > 0) {
            return res.status(400).json({
                error: `Cannot delete: This component is used in ${usageCount} salary group(s). Remove it from salary groups first.`
            });
        }

        const item = await prisma.earningDeductionType.delete({
            where: { id: parseInt(id) }
        });

        await logActivity(null, 'DELETED', 'EARNING_DEDUCTION_TYPE', item.name);
        res.json({ message: "Component deleted successfully" });
    } catch (error) {
        console.error("Error deleting component:", error);
        res.status(500).json({ error: "Failed to delete component" });
    }
});

// PATCH /:id/toggle — Toggle Active/Inactive status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const item = await prisma.earningDeductionType.findUnique({
            where: { id: parseInt(id) }
        });

        if (!item) {
            return res.status(404).json({ error: "Component not found" });
        }

        const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prisma.earningDeductionType.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });

        await logActivity(null, 'UPDATED', 'EARNING_DEDUCTION_TYPE', `${item.name} → ${newStatus}`);
        res.json(updated);
    } catch (error) {
        console.error("Error toggling status:", error);
        res.status(500).json({ error: "Failed to toggle status" });
    }
});

export default router;
// Triggering IDE re-scan
