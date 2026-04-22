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
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
/**
 * GET all optional holiday requests
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, status } = req.query;
        let where = {};
        if (employeeId)
            where.userId = Number(employeeId);
        if (status)
            where.status = status;
        const requests = yield prismaClient_1.default.optionalHolidayRequest.findMany({
            where,
            include: {
                user: { select: { name: true, employee_level_id: true } },
                holiday: { select: { name: true, date: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    }
    catch (err) {
        console.error('Fetch Holiday Requests Error:', err);
        res.status(500).json({ error: 'Failed to fetch holiday requests' });
    }
}));
/**
 * POST submit an optional holiday request
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, holidayId, remarks } = req.body;
        if (!userId || !holidayId) {
            return res.status(400).json({ error: 'User ID and Holiday ID are required' });
        }
        // Validate if it's an optional holiday
        const holiday = yield prismaClient_1.default.holiday.findUnique({ where: { id: holidayId } });
        if (!holiday || holiday.type !== 'Optional') {
            return res.status(400).json({ error: 'This is not an optional holiday' });
        }
        const request = yield prismaClient_1.default.optionalHolidayRequest.create({
            data: {
                userId: Number(userId),
                holidayId: Number(holidayId),
                remarks,
                status: 'Pending'
            }
        });
        res.status(201).json(request);
    }
    catch (err) {
        console.error('Submit Holiday Request Error:', err);
        res.status(500).json({ error: 'Failed to submit holiday request' });
    }
}));
/**
 * PATCH update request status (Approve/Reject)
 */
router.patch('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { status, remarks } = req.body;
        if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const updated = yield prismaClient_1.default.optionalHolidayRequest.update({
            where: { id },
            data: {
                status,
                remarks: remarks || undefined
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Update Request Status Error:', err);
        res.status(500).json({ error: 'Failed to update request status' });
    }
}));
exports.default = router;
