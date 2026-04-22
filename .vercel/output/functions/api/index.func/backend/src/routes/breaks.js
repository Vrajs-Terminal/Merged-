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
// Get active break for current user
router.get('/active', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const activeBreak = await prismaClient_1.default.breakLog.findFirst({
            where: { user_id: user.id, status: 'Ongoing' }
        });
        res.json(activeBreak);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});
// Start a break
router.post('/start', authMiddleware_1.authenticateToken, async (req, res) => {
    const user = req.user;
    const { break_type } = req.body;
    try {
        // Check if already on break
        const existing = await prismaClient_1.default.breakLog.findFirst({
            where: { user_id: user.id, status: 'Ongoing' }
        });
        if (existing)
            return res.status(400).json({ error: 'Already on a break' });
        // Find today's attendance record
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await prismaClient_1.default.attendanceRecord.findUnique({
            where: { user_id_date: { user_id: user.id, date: today } }
        });
        const newBreak = await prismaClient_1.default.breakLog.create({
            data: {
                user_id: user.id,
                attendance_id: attendance === null || attendance === void 0 ? void 0 : attendance.id,
                break_type: break_type || 'Standard',
                status: 'Ongoing'
            }
        });
        await (0, activityLogger_1.logActivity)(user.id, 'STARTED', 'BREAK', break_type);
        res.status(201).json(newBreak);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});
// End a break
router.post('/end', authMiddleware_1.authenticateToken, async (req, res) => {
    const user = req.user;
    try {
        const activeBreak = await prismaClient_1.default.breakLog.findFirst({
            where: { user_id: user.id, status: 'Ongoing' }
        });
        if (!activeBreak)
            return res.status(400).json({ error: 'No active break found' });
        const endTime = new Date();
        const durationMins = Math.round((endTime.getTime() - activeBreak.start_time.getTime()) / 60000);
        const updated = await prismaClient_1.default.breakLog.update({
            where: { id: activeBreak.id },
            data: {
                end_time: endTime,
                duration_minutes: durationMins,
                status: 'Completed'
            }
        });
        // Update attendance record total break minutes
        if (activeBreak.attendance_id) {
            await prismaClient_1.default.attendanceRecord.update({
                where: { id: activeBreak.attendance_id },
                data: {
                    break_minutes: { increment: durationMins }
                }
            });
        }
        await (0, activityLogger_1.logActivity)(user.id, 'ENDED', 'BREAK', `${activeBreak.break_type} (${durationMins} mins)`);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});
exports.default = router;
//# sourceMappingURL=breaks.js.map