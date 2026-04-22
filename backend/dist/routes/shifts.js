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
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all shifts
router.get('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shifts = yield prismaClient_1.default.shift.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(shifts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch shifts', details: error.message });
    }
}));
// Create a new shift
router.post('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, start_time, end_time, grace_time_minutes, half_day_min_hours, full_day_min_hours, break_duration_mins } = req.body;
    if (!name || !start_time || !end_time) {
        return res.status(400).json({ error: 'Name, start time, and end time are required' });
    }
    try {
        const shift = yield prismaClient_1.default.shift.create({
            data: {
                name,
                start_time,
                end_time,
                grace_time_minutes: grace_time_minutes || 0,
                half_day_min_hours: half_day_min_hours || 4.0,
                full_day_min_hours: full_day_min_hours || 8.0,
                break_duration_mins: break_duration_mins || 60
            }
        });
        const user = req.user;
        yield (0, activityLogger_1.logActivity)(user.id, 'CREATED', 'SHIFT', shift.name);
        res.status(201).json({ message: 'Shift created successfully', shift });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create shift', details: error.message });
    }
}));
// Update a shift
router.put('/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, start_time, end_time, grace_time_minutes, half_day_min_hours, full_day_min_hours, break_duration_mins, is_active } = req.body;
    try {
        const shift = yield prismaClient_1.default.shift.update({
            where: { id: parseInt(id) },
            data: {
                name,
                start_time,
                end_time,
                grace_time_minutes,
                half_day_min_hours,
                full_day_min_hours,
                break_duration_mins,
                is_active
            }
        });
        const user = req.user;
        yield (0, activityLogger_1.logActivity)(user.id, 'UPDATED', 'SHIFT', shift.name);
        res.json({ message: 'Shift updated successfully', shift });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update shift', details: error.message });
    }
}));
// Delete a shift
router.delete('/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Prevent deletion if users are assigned to it
        const usersCount = yield prismaClient_1.default.user.count({ where: { shift_id: parseInt(id) } });
        if (usersCount > 0) {
            return res.status(400).json({ error: 'Cannot delete shift as it is assigned to employees. Please reassign them first.' });
        }
        const shift = yield prismaClient_1.default.shift.delete({
            where: { id: parseInt(id) }
        });
        const user = req.user;
        yield (0, activityLogger_1.logActivity)(user.id, 'DELETED', 'SHIFT', shift.name);
        res.json({ message: 'Shift deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete shift', details: error.message });
    }
}));
exports.default = router;
