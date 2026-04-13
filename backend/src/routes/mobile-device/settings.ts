import express from 'express';
import { PrismaClient } from '../../lib/generated/prisma-client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all employees with their mobile device bindings
router.get('/', async (req, res) => {
    try {
        const { search, department_id, status } = req.query;

        let userFilter: any = {};
        if (search) {
            userFilter.name = { contains: String(search) };
        }
        if (department_id) {
            userFilter.department_id = Number(department_id);
        }

        let deviceFilter: any = {};
        if (status === 'Bound') {
            deviceFilter.status = 'Bound';
        } else if (status === 'Unbound') {
            deviceFilter.status = 'Unbound'; // or null device
        }

        const users = await prisma.user.findMany({
            where: userFilter,
            select: {
                id: true,
                name: true,
                department: { select: { id: true, name: true } },
                mobileDevice: true
            },
            orderBy: { id: 'desc' }
        });

        // Filter post-query for 'Unbound' if user has no device entry
        let results = users;
        if (status === 'Bound') {
            results = users.filter(u => u.mobileDevice && u.mobileDevice.status === 'Bound');
        } else if (status === 'Unbound') {
            results = users.filter(u => !u.mobileDevice || u.mobileDevice.status === 'Unbound');
        }

        res.json(results);
    } catch (error) {
        console.error('Fetch device settings error:', error);
        res.status(500).json({ error: 'Failed to fetch device settings' });
    }
});

// Bind a device manually (Admin action)
router.post('/bind', async (req, res) => {
    try {
        const { user_id, macAddress, deviceId, deviceName } = req.body;
        if (!user_id) return res.status(400).json({ error: 'User ID is required' });

        const device = await prisma.mobileDevice.upsert({
            where: { userId: Number(user_id) },
            create: {
                userId: Number(user_id),
                macAddress: macAddress || null,
                deviceId: deviceId || null,
                deviceName: deviceName || 'Manual Bind',
                status: 'Bound'
            },
            update: {
                macAddress: macAddress || null,
                deviceId: deviceId || null,
                deviceName: deviceName || 'Manual Bind',
                status: 'Bound'
            }
        });

        res.json({ message: 'Device bound successfully', device });
    } catch (error) {
        console.error('Bind device error:', error);
        res.status(500).json({ error: 'Failed to bind device' });
    }
});

// Unbind a device
router.post('/unbind', async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: 'User ID is required' });

        const device = await prisma.mobileDevice.update({
            where: { userId: Number(user_id) },
            data: {
                status: 'Unbound',
                macAddress: null,
                deviceId: null,
                deviceName: null,
                osVersion: null,
                deviceModel: null
            }
        });

        res.json({ message: 'Device unbound successfully', device });
    } catch (error) {
        if ((error as any).code === 'P2025') {
            // Record doesn't exist, which means already unbound conceptually
            return res.json({ message: 'Device is already unbound' });
        }
        console.error('Unbind device error:', error);
        res.status(500).json({ error: 'Failed to unbind device' });
    }
});

// Reset a device (Unbind and clear logs if necessary)
router.post('/reset', async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: 'User ID is required' });

        await prisma.mobileDevice.delete({
            where: { userId: Number(user_id) }
        });

        res.json({ message: 'Device reset successfully' });
    } catch (error) {
        if ((error as any).code === 'P2025') {
            return res.json({ message: 'Device already reset' });
        }
        console.error('Reset device error:', error);
        res.status(500).json({ error: 'Failed to reset device' });
    }
});

// Toggle Active status
router.patch('/toggle-status', async (req, res) => {
    try {
        const { user_id, isActive } = req.body;

        const device = await prisma.mobileDevice.upsert({
            where: { userId: Number(user_id) },
            create: {
                userId: Number(user_id),
                isActive: isActive,
                status: 'Unbound'
            },
            update: {
                isActive: isActive
            }
        });

        res.json({ message: `Access ${isActive ? 'enabled' : 'disabled'} successfully`, device });
    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});

export default router;
