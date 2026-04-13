import express from 'express';
import { PrismaClient } from '../../lib/generated/prisma-client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all device change requests
router.get('/', async (req, res) => {
    try {
        const { status, startDate, endDate, search } = req.query;

        let filter: any = {};
        if (status) filter.status = String(status);
        if (startDate && endDate) {
            filter.requestDate = {
                gte: new Date(String(startDate)),
                lte: new Date(String(endDate))
            };
        }
        if (search) {
            filter.user = {
                name: { contains: String(search) }
            };
        }

        const requests = await prisma.deviceChangeRequest.findMany({
            where: filter,
            include: {
                user: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } }
            },
            orderBy: { requestDate: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        console.error('Fetch device requests error:', error);
        res.status(500).json({ error: 'Failed to fetch device requests' });
    }
});

// Employee raises a new device change request
router.post('/', async (req, res) => {
    try {
        const { user_id, newDeviceId, newDeviceName, reason, attachmentUrl } = req.body;
        
        if (!user_id || !newDeviceId || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Fetch current bound device
        const currentDevice = await prisma.mobileDevice.findUnique({
            where: { userId: Number(user_id) }
        });

        const newRequest = await prisma.deviceChangeRequest.create({
            data: {
                userId: Number(user_id),
                oldDeviceId: currentDevice?.deviceId || null,
                oldDeviceName: currentDevice?.deviceName || null,
                newDeviceId,
                newDeviceName,
                reason,
                attachmentUrl,
                status: 'Pending'
            }
        });

        res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
    } catch (error) {
        console.error('Create device request error:', error);
        res.status(500).json({ error: 'Failed to submit request' });
    }
});

// Admin approves a request
router.patch('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_id, remarks } = req.body;

        const request = await prisma.deviceChangeRequest.findUnique({ where: { id: Number(id) } });
        if (!request) return res.status(404).json({ error: 'Request not found' });
        if (request.status !== 'Pending') return res.status(400).json({ error: 'Request is already processed' });

        // Update request status AND update user's bound device dynamically
        const [updatedRequest, updatedDevice] = await prisma.$transaction([
            prisma.deviceChangeRequest.update({
                where: { id: Number(id) },
                data: {
                    status: 'Approved',
                    approvedById: admin_id ? Number(admin_id) : null,
                    adminRemarks: remarks,
                    resolvedAt: new Date()
                }
            }),
            prisma.mobileDevice.upsert({
                where: { userId: request.userId },
                create: {
                    userId: request.userId,
                    deviceId: request.newDeviceId,
                    deviceName: request.newDeviceName,
                    status: 'Bound',
                    isActive: true
                },
                update: {
                    deviceId: request.newDeviceId,
                    deviceName: request.newDeviceName,
                    status: 'Bound',
                    isActive: true
                }
            })
        ]);

        res.json({ message: 'Request approved and device bound to new device', request: updatedRequest, device: updatedDevice });
    } catch (error) {
        console.error('Approve device request error:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

// Admin rejects a request
router.patch('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_id, remarks } = req.body;

        const request = await prisma.deviceChangeRequest.findUnique({ where: { id: Number(id) } });
        if (!request) return res.status(404).json({ error: 'Request not found' });
        if (request.status !== 'Pending') return res.status(400).json({ error: 'Request is already processed' });

        const updatedRequest = await prisma.deviceChangeRequest.update({
            where: { id: Number(id) },
            data: {
                status: 'Rejected',
                approvedById: admin_id ? Number(admin_id) : null,
                adminRemarks: remarks,
                resolvedAt: new Date()
            }
        });

        res.json({ message: 'Request rejected successfully', request: updatedRequest });
    } catch (error) {
        console.error('Reject device request error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

export default router;
