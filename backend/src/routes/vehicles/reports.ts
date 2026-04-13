import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET filtered vehicle report
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, category_id, user_id, status, start_date, end_date } = req.query;
        const where: any = {};

        if (branch_id) where.branchId = Number(branch_id);
        if (department_id) where.departmentId = Number(department_id);
        if (category_id) where.categoryId = Number(category_id);
        if (user_id) where.userId = Number(user_id);
        if (status) where.status = status;
        if (start_date) where.assigned_date = { gte: new Date(start_date as string) };
        if (end_date) where.assigned_date = { ...where.assigned_date, lte: new Date(end_date as string) };

        const vehicles = await prisma.employeeVehicle.findMany({
            where,
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } }
            },
            orderBy: { assigned_date: 'desc' }
        });

        // Compute summary stats
        const totalValue = vehicles.reduce((s, v) => s + (v.vehicle_value || 0), 0);
        const categoryBreakdown: Record<string, number> = {};
        vehicles.forEach(v => {
            const cat = v.category?.name || 'Uncategorized';
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
        });

        res.json({
            vehicles,
            stats: {
                total: vehicles.length,
                active: vehicles.filter(v => v.status === 'Active').length,
                inactive: vehicles.filter(v => v.status === 'Inactive').length,
                totalValue: Math.round(totalValue * 100) / 100,
                categoryBreakdown
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET QR data for a vehicle
router.get('/qr/:id', async (req, res) => {
    try {
        const vehicle = await prisma.employeeVehicle.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } }
            }
        });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        // Return structured data that frontend will encode into QR
        const qrPayload = {
            vehicle_id: vehicle.id,
            employee_id: vehicle.userId,
            vehicle_name: vehicle.vehicle_name,
            vehicle_number: vehicle.vehicle_number,
            employee_name: vehicle.user.name,
            category: vehicle.category.name,
            branch: vehicle.branch?.name || '—',
            status: vehicle.status
        };

        res.json({ vehicle, qrPayload });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET bulk QR data for multiple vehicles
router.get('/qr-bulk', async (req, res) => {
    try {
        const { branch_id, user_id } = req.query;
        const where: any = { status: 'Active' };
        if (branch_id) where.branchId = Number(branch_id);
        if (user_id) where.userId = Number(user_id);

        const vehicles = await prisma.employeeVehicle.findMany({
            where,
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } }
            },
            orderBy: { vehicle_number: 'asc' }
        });

        const qrList = vehicles.map(v => ({
            id: v.id,
            vehicle_name: v.vehicle_name,
            vehicle_number: v.vehicle_number,
            employee_name: v.user.name,
            employee_id: v.userId,
            category: v.category.name,
            branch: v.branch?.name || '—',
            status: v.status,
            qrPayload: JSON.stringify({
                vehicle_id: v.id,
                employee_id: v.userId,
                vehicle_number: v.vehicle_number,
                employee_name: v.user.name
            })
        }));

        res.json(qrList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
