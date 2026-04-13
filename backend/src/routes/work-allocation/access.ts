import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all access rules
router.get('/', async (req, res) => {
    try {
        const rules = await prisma.workAllocationAccess.findMany({
            include: {
                assignBy: { select: { id: true, name: true, role: true, employeeGrade: { select: { name: true } }, designation: { select: { name: true } } } },
                assignTo: { select: { id: true, name: true, role: true, employeeGrade: { select: { name: true } }, designation: { select: { name: true } } } },
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Enhance rules with category names based on IDs
        const categoryIdsSet = new Set<number>();
        rules.forEach((r: any) => {
            const arr = Array.isArray(r.category_ids) ? r.category_ids as number[] : [];
            arr.forEach((id: number) => categoryIdsSet.add(id));
        });

        const catIds = Array.from(categoryIdsSet);
        const categories = await prisma.workCategory.findMany({
            where: { id: { in: catIds } },
            select: { id: true, name: true, code: true }
        });

        const enhancedRules = rules.map((r: any) => {
            const arr = Array.isArray(r.category_ids) ? r.category_ids as number[] : [];
            const mappedCats = arr.map((catReqId: number) => categories.find((c: any) => c.id === catReqId)).filter(Boolean);
            return {
                ...r,
                categories: mappedCats
            };
        });

        res.status(200).json(enhancedRules);
    } catch (error) {
        console.error('Fetch access error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST new access rule
router.post('/', async (req, res) => {
    try {
        const { assign_by_id, assign_to_id, category_ids, access_type, max_task_per_day, max_task_per_employee, allow_reassign, approval_required, status } = req.body;

        if (!assign_by_id || !assign_to_id || !category_ids) {
            return res.status(400).json({ message: 'assign_by_id, assign_to_id and category_ids are required' });
        }

        if (assign_by_id === assign_to_id) {
            return res.status(400).json({ message: 'User cannot assign to themselves.' });
        }

        // Check for duplicates
        const existing = await prisma.workAllocationAccess.findFirst({
            where: { assign_by_id: Number(assign_by_id), assign_to_id: Number(assign_to_id) }
        });

        if (existing) {
            return res.status(400).json({ message: 'Access Rule already exists for this mapping. Please edit the existing one.' });
        }

        // Check for circular assignment
        const circular = await prisma.workAllocationAccess.findFirst({
            where: { assign_by_id: Number(assign_to_id), assign_to_id: Number(assign_by_id) }
        });

        if (circular) {
             return res.status(400).json({ message: 'Circular assignment detected (assignTo is already assigning to assignBy).' });
        }

        const rule = await prisma.workAllocationAccess.create({
            data: {
                assign_by_id: Number(assign_by_id),
                assign_to_id: Number(assign_to_id),
                category_ids, // Requires JSON array [1, 2, 3] etc
                access_type: access_type || 'Full',
                max_task_per_day: max_task_per_day ? Number(max_task_per_day) : 0,
                max_task_per_employee: max_task_per_employee ? Number(max_task_per_employee) : 0,
                allow_reassign: typeof allow_reassign === 'boolean' ? allow_reassign : false,
                approval_required: typeof approval_required === 'boolean' ? approval_required : false,
                status: status || 'Active',
            }
        });
        res.status(201).json(rule);

    } catch (error) {
        console.error('Create access rule error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category_ids, access_type, max_task_per_day, max_task_per_employee, allow_reassign, approval_required, status } = req.body;

        const updated = await prisma.workAllocationAccess.update({
            where: { id: Number(id) },
            data: {
                category_ids,
                access_type,
                max_task_per_day: max_task_per_day !== undefined ? Number(max_task_per_day) : undefined,
                max_task_per_employee: max_task_per_employee !== undefined ? Number(max_task_per_employee) : undefined,
                allow_reassign: allow_reassign !== undefined ? allow_reassign : undefined,
                approval_required: approval_required !== undefined ? approval_required : undefined,
                status
            }
        });
        res.status(200).json(updated);
    } catch (error) {
        console.error('Update access rule error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.workAllocationAccess.update({
            where: { id: Number(id) },
            data: { status: 'Inactive' }
        });
        res.status(200).json({ message: 'Access Rule deactivated' });
    } catch (error) {
        console.error('Delete access rule error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
