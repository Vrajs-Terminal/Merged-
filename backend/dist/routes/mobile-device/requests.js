"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_client_1 = require("../../lib/generated/prisma-client");
const router = express_1.default.Router();
const prisma = new prisma_client_1.PrismaClient();
// Get all device change requests
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, startDate, endDate, search } = req.query;
        let filter = {};
        if (status)
            filter.status = String(status);
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
        const requests = yield prisma.deviceChangeRequest.findMany({
            where: filter,
            include: {
                user: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } }
            },
            orderBy: { requestDate: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        console.error('Fetch device requests error:', error);
        res.status(500).json({ error: 'Failed to fetch device requests' });
    }
}));
// Employee raises a new device change request
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, newDeviceId, newDeviceName, reason, attachmentUrl } = req.body;
        if (!user_id || !newDeviceId || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Fetch current bound device
        const currentDevice = yield prisma.mobileDevice.findUnique({
            where: { userId: Number(user_id) }
        });
        const newRequest = yield prisma.deviceChangeRequest.create({
            data: {
                userId: Number(user_id),
                oldDeviceId: (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.deviceId) || null,
                oldDeviceName: (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.deviceName) || null,
                newDeviceId,
                newDeviceName,
                reason,
                attachmentUrl,
                status: 'Pending'
            }
        });
        res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
    }
    catch (error) {
        console.error('Create device request error:', error);
        res.status(500).json({ error: 'Failed to submit request' });
    }
}));
// Admin approves a request
router.patch('/:id/approve', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { admin_id, remarks } = req.body;
        const request = yield prisma.deviceChangeRequest.findUnique({ where: { id: Number(id) } });
        if (!request)
            return res.status(404).json({ error: 'Request not found' });
        if (request.status !== 'Pending')
            return res.status(400).json({ error: 'Request is already processed' });
        // Update request status AND update user's bound device dynamically
        const [updatedRequest, updatedDevice] = yield prisma.$transaction([
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
    }
    catch (error) {
        console.error('Approve device request error:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
}));
// Admin rejects a request
router.patch('/:id/reject', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { admin_id, remarks } = req.body;
        const request = yield prisma.deviceChangeRequest.findUnique({ where: { id: Number(id) } });
        if (!request)
            return res.status(404).json({ error: 'Request not found' });
        if (request.status !== 'Pending')
            return res.status(400).json({ error: 'Request is already processed' });
        const updatedRequest = yield prisma.deviceChangeRequest.update({
            where: { id: Number(id) },
            data: {
                status: 'Rejected',
                approvedById: admin_id ? Number(admin_id) : null,
                adminRemarks: remarks,
                resolvedAt: new Date()
            }
        });
        res.json({ message: 'Request rejected successfully', request: updatedRequest });
    }
    catch (error) {
        console.error('Reject device request error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
}));
exports.default = router;
