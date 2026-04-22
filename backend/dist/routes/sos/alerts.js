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
 * GET list of all SOS alerts (with filters)
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employee_id, date_from, date_to, sos_type_id, status } = req.query;
        const where = {};
        if (employee_id)
            where.userId = Number(employee_id);
        if (sos_type_id)
            where.sosTypeId = Number(sos_type_id);
        if (status)
            where.status = String(status);
        if (date_from || date_to) {
            where.createdAt = {};
            if (date_from)
                where.createdAt.gte = new Date(String(date_from));
            if (date_to)
                where.createdAt.lte = new Date(String(date_to));
        }
        const alerts = yield prismaClient_1.default.sosAlert.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, employee_level_id: true } },
                sosType: { select: { id: true, name: true, imageUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(alerts);
    }
    catch (err) {
        console.error('Fetch SOS Alerts Error:', err);
        res.status(500).json({ error: 'Failed to fetch SOS alerts' });
    }
}));
/**
 * POST trigger a new SOS alert
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, sos_type_id, message, imageUrl, latitude, longitude } = req.body;
        if (!user_id || !sos_type_id) {
            return res.status(400).json({ error: 'User ID and SOS Type ID are required' });
        }
        const alert = yield prismaClient_1.default.sosAlert.create({
            data: {
                userId: Number(user_id),
                sosTypeId: Number(sos_type_id),
                message: message || null,
                imageUrl: imageUrl || null,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                status: 'Active'
            },
            include: {
                user: { select: { id: true, name: true } },
                sosType: { select: { id: true, name: true } }
            }
        });
        // Trigger notifications? (Future: WhatsApp, SMS, Push)
        res.status(201).json(alert);
    }
    catch (err) {
        console.error('Trigger SOS Alert Error:', err);
        res.status(500).json({ error: 'Failed to trigger SOS alert' });
    }
}));
exports.default = router;
