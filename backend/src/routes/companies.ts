import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = Router();

// Get all companies ordered by index
router.get('/', async (req, res) => {
    try {
        const companies = await prisma.company.findMany({
            orderBy: { order_index: 'asc' }
        });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

// Create a new sister company
router.post('/', async (req, res) => {
    let { name, code, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Company Name is required' });

    // Handle optional code
    if (!code || code.trim() === '') code = null;

    try {
        const maxOrder = await prisma.company.aggregate({ _max: { order_index: true } });
        const newOrderIndex = (maxOrder._max.order_index ?? 0) + 1;

        const company = await prisma.company.create({
            data: {
                name,
                code,
                status: status || 'Active',
                order_index: newOrderIndex
            }
        });
        await logActivity(null, 'CREATED', 'COMPANY', company.name);
        res.status(201).json(company);
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Company Code must be unique' });
        res.status(500).json({ error: 'Failed to create company' });
    }
});

// Update a company
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    let { name, code, status } = req.body;

    // Handle optional code
    if (!code || code.trim() === '') code = null;

    try {
        const company = await prisma.company.update({
            where: { id: Number(id) },
            data: { name, code, status }
        });
        await logActivity(null, 'UPDATED', 'COMPANY', company.name);
        res.json(company);
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Company Code must be unique' });
        res.status(500).json({ error: 'Failed to update company' });
    }
});

// Delete a company
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Prevent deletion if branches rely on it
        const linkedBranches = await prisma.branch.count({ where: { company_id: Number(id) } });
        if (linkedBranches > 0) {
            return res.status(400).json({ error: 'Cannot delete: Branches are currently assigned to this company. Soft-delete instead by changing Status to Inactive.' });
        }

        await prisma.company.delete({ where: { id: Number(id) } });
        await logActivity(null, 'DELETED', 'COMPANY', `Company #${id}`);
        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete company' });
    }
});

// Reorder companies
router.put('/reorder/update', async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid items array' });
    }

    try {
        const transaction = items.map((item: any) =>
            prisma.company.update({
                where: { id: item.id },
                data: { order_index: item.order_index }
            })
        );
        await prisma.$transaction(transaction);
        await logActivity(null, 'REORDERED', 'COMPANY', 'Reordered sister companies');
        res.json({ message: 'Reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder companies' });
    }
});

export default router;
