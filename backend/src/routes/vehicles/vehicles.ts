import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all vehicles with filters
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, category_id, user_id, status } = req.query;
        const where: any = {};
        if (branch_id) where.branchId = Number(branch_id);
        if (department_id) where.departmentId = Number(department_id);
        if (category_id) where.categoryId = Number(category_id);
        if (user_id) where.userId = Number(user_id);
        if (status) where.status = status;

        const vehicles = await prisma.employeeVehicle.findMany({
            where,
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(vehicles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET single vehicle by id
router.get('/:id', async (req, res) => {
    try {
        const vehicle = await prisma.employeeVehicle.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } }
            }
        });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET validate unique vehicle number
router.get('/check-number/:number', async (req, res) => {
    try {
        const { exclude_id } = req.query;
        const where: any = { vehicle_number: req.params.number.toUpperCase() };
        if (exclude_id) where.NOT = { id: Number(exclude_id) };

        const existing = await prisma.employeeVehicle.findFirst({ where });
        res.json({ exists: !!existing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create vehicle
router.post('/', async (req, res) => {
    try {
        const {
            user_id, category_id, branch_id, department_id,
            vehicle_name, vehicle_number, vehicle_value,
            image_url_1, image_url_2, image_url_3,
            status, assigned_date
        } = req.body;

        if (!user_id || !category_id || !vehicle_name?.trim() || !vehicle_number?.trim()) {
            return res.status(400).json({ message: 'Employee, category, vehicle name, and vehicle number are required' });
        }

        // Unique constraint check
        const dup = await prisma.employeeVehicle.findUnique({
            where: { vehicle_number: vehicle_number.trim().toUpperCase() }
        });
        if (dup) return res.status(409).json({ message: 'Vehicle number already exists in the system' });

        const vehicle = await prisma.employeeVehicle.create({
            data: {
                userId: Number(user_id),
                categoryId: Number(category_id),
                branchId: branch_id ? Number(branch_id) : null,
                departmentId: department_id ? Number(department_id) : null,
                vehicle_name: vehicle_name.trim(),
                vehicle_number: vehicle_number.trim().toUpperCase(),
                vehicle_value: vehicle_value ? Number(vehicle_value) : 0,
                image_url_1: image_url_1 || null,
                image_url_2: image_url_2 || null,
                image_url_3: image_url_3 || null,
                status: status || 'Active',
                assigned_date: assigned_date ? new Date(assigned_date) : new Date()
            },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } }
            }
        });
        res.status(201).json(vehicle);
    } catch (err: any) {
        if (err.code === 'P2002') return res.status(409).json({ message: 'Vehicle number already exists' });
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update vehicle
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const {
            user_id, category_id, branch_id, department_id,
            vehicle_name, vehicle_number, vehicle_value,
            image_url_1, image_url_2, image_url_3,
            status, assigned_date
        } = req.body;

        if (!vehicle_name?.trim() || !vehicle_number?.trim()) {
            return res.status(400).json({ message: 'Vehicle name and number are required' });
        }

        // Check unique number (excluding self)
        const dup = await prisma.employeeVehicle.findFirst({
            where: { vehicle_number: vehicle_number.trim().toUpperCase(), NOT: { id } }
        });
        if (dup) return res.status(409).json({ message: 'Vehicle number already registered to another vehicle' });

        const updated = await prisma.employeeVehicle.update({
            where: { id },
            data: {
                userId: Number(user_id),
                categoryId: Number(category_id),
                branchId: branch_id ? Number(branch_id) : null,
                departmentId: department_id ? Number(department_id) : null,
                vehicle_name: vehicle_name.trim(),
                vehicle_number: vehicle_number.trim().toUpperCase(),
                vehicle_value: vehicle_value ? Number(vehicle_value) : 0,
                image_url_1: image_url_1 || null,
                image_url_2: image_url_2 || null,
                image_url_3: image_url_3 || null,
                status,
                assigned_date: assigned_date ? new Date(assigned_date) : undefined
            },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } }
            }
        });
        res.json(updated);
    } catch (err: any) {
        if (err.code === 'P2002') return res.status(409).json({ message: 'Vehicle number already exists' });
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
    try {
        await prisma.employeeVehicle.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Vehicle deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
