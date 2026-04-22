"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all document requests (Admin only or filter by user)
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const where = {};
        if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
            where.user_id = user.id;
        }
        const requests = await prismaClient_1.default.documentRequest.findMany({
            where,
            include: { user: { select: { name: true } }, approver: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch document requests' });
    }
});
// Create a new document request
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    const { request_type, requested_data, reason } = req.body;
    const user = req.user;
    try {
        const request = await prismaClient_1.default.documentRequest.create({
            data: {
                user_id: user.id,
                request_type,
                requested_data,
                reason,
                status: 'Pending'
            }
        });
        await (0, activityLogger_1.logActivity)(user.id, 'CREATED', 'DOCUMENT_REQUEST', request_type);
        res.status(201).json(request);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create document request' });
    }
});
// Approve/Reject a request
router.put('/:id/status', authMiddleware_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const approver = req.user;
    if (approver.role !== 'Admin' && approver.role !== 'SuperAdmin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        const updated = await prismaClient_1.default.documentRequest.update({
            where: { id: parseInt(id) },
            data: {
                status,
                approver_id: approver.id
            }
        });
        await (0, activityLogger_1.logActivity)(approver.id, 'UPDATED', 'DOCUMENT_REQUEST', `${updated.request_type} - ${status}`);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});
exports.default = router;
//# sourceMappingURL=document-requests.js.map