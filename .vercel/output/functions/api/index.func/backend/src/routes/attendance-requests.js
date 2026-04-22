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
// =====================================
// Submit a Request (Employee)
// =====================================
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    const { request_type, date, requested_data, reason } = req.body;
    const user = req.user;
    if (!request_type || !date || !reason) {
        return res.status(400).json({ error: 'Type, Date, and Reason are required' });
    }
    try {
        const dateObj = new Date(date);
        const request = await prismaClient_1.default.attendanceRequest.create({
            data: {
                user_id: user.id,
                request_type,
                date: dateObj,
                requested_data: requested_data || {},
                reason,
                status: 'Pending'
            }
        });
        await (0, activityLogger_1.logActivity)(user.id, 'CREATED', 'ATTENDANCE_REQUEST', request_type);
        res.status(201).json({ message: `${request_type} request submitted successfully`, request });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit request', details: error.message });
    }
});
// =====================================
// Fetch Requests (Admin lists vs Employee logs)
// =====================================
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { status, user_id, type } = req.query;
        const user = req.user;
        const whereClause = {};
        // Security check
        if (user.role !== 'Admin' && user.role !== 'Super Admin') {
            whereClause.user_id = user.id; // Employees only see their own requests
        }
        else if (user_id) {
            whereClause.user_id = parseInt(user_id);
        }
        if (status)
            whereClause.status = status;
        if (type)
            whereClause.request_type = type;
        const requests = await prismaClient_1.default.attendanceRequest.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, employee_grade_id: true } },
                approver: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests', details: error.message });
    }
});
// =====================================
// Approve or Reject a Request (Manager/HR)
// =====================================
router.put('/:id/review', authMiddleware_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, approver_remarks } = req.body; // 'Approved' or 'Rejected'
    const user = req.user;
    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
        return res.status(403).json({ error: 'Unauthorized. Only admins can review requests.' });
    }
    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Approved or Rejected' });
    }
    try {
        const request = await prismaClient_1.default.attendanceRequest.update({
            where: { id: parseInt(id) },
            data: {
                status,
                approver_id: user.id,
                approver_remarks
            }
        });
        await (0, activityLogger_1.logActivity)(user.id, 'UPDATED', 'ATTENDANCE_REQUEST', `Request #${id} marked as ${status}`);
        res.json({ message: `Request successfully ${status.toLowerCase()}`, request });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to review request', details: error.message });
    }
});
// =====================================
// Delete/Cancel a Pending Request
// =====================================
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const existing = await prismaClient_1.default.attendanceRequest.findUnique({ where: { id: parseInt(id) } });
        if (!existing)
            return res.status(404).json({ error: 'Not found' });
        if (existing.user_id !== user.id && user.role !== 'Admin') {
            return res.status(403).json({ error: 'Unauthorized to cancel this request.' });
        }
        if (existing.status !== 'Pending' && user.role !== 'Admin') {
            return res.status(400).json({ error: 'Cannot cancel an already processed request.' });
        }
        await prismaClient_1.default.attendanceRequest.delete({ where: { id: parseInt(id) } });
        await (0, activityLogger_1.logActivity)(user.id, 'DELETED', 'ATTENDANCE_REQUEST', `Cancelled request #${id}`);
        res.json({ message: 'Request cancelled successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete request', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=attendance-requests.js.map