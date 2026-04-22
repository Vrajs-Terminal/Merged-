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
// GET all visitors profile
router.get('/profiles', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: String(search) } },
                { mobile: { contains: String(search) } }
            ];
        }
        const profiles = yield prismaClient_1.default.visitorProfile.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(profiles);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// GET all visitor logs (visits)
router.get('/logs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, visitor_id, branch_id, date } = req.query;
        const where = {};
        if (status)
            where.status = String(status);
        if (visitor_id)
            where.visitor_id = Number(visitor_id);
        if (branch_id)
            where.branch_id = Number(branch_id);
        if (date) {
            where.in_time = {
                gte: new Date(String(date) + 'T00:00:00Z'),
                lte: new Date(String(date) + 'T23:59:59Z')
            };
        }
        const logs = yield prismaClient_1.default.visitorLog.findMany({
            where,
            include: {
                visitor: { select: { id: true, name: true, mobile: true, photo_url: true, is_blacklisted: true } },
                employee: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                subType: { select: { id: true, name: true, category: true } }
            },
            orderBy: { in_time: 'desc' }
        });
        res.json(logs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// GET Inside Count
router.get('/inside-count', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield prismaClient_1.default.visitorLog.count({
            where: { status: 'Inside' }
        });
        res.json({ count });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST Check-In (New Visit)
router.post('/check-in', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, mobile, email, company, city, photo_url, sub_type_id, employee_id, purpose, vehicle_number, added_by } = req.body;
        if (!name || !mobile)
            return res.status(400).json({ message: 'Name and Mobile are required' });
        // Upsert Visitor Profile
        const visitorProfile = yield prismaClient_1.default.visitorProfile.upsert({
            where: { mobile: String(mobile) },
            update: { name, email, company, city, photo_url },
            create: { name, mobile, email, company, city, photo_url }
        });
        if (visitorProfile.is_blacklisted) {
            return res.status(403).json({ message: 'Visitor is blacklisted' });
        }
        // Get employee branch automatically
        const employee = employee_id ? yield prismaClient_1.default.user.findUnique({
            where: { id: Number(employee_id) },
            select: { branch_id: true, department_id: true }
        }) : null;
        // Create Visit Log
        const visitLog = yield prismaClient_1.default.visitorLog.create({
            data: {
                visitor_id: visitorProfile.id,
                sub_type_id: sub_type_id ? Number(sub_type_id) : null,
                employee_id: employee_id ? Number(employee_id) : null,
                branch_id: employee === null || employee === void 0 ? void 0 : employee.branch_id,
                department_id: employee === null || employee === void 0 ? void 0 : employee.department_id,
                purpose: purpose || null,
                vehicle_number: vehicle_number || null,
                added_by: added_by ? Number(added_by) : null,
                status: 'Inside'
            },
            include: { visitor: true }
        });
        res.status(201).json(visitLog);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PUT Check-Out
router.put('/check-out/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const updated = yield prismaClient_1.default.visitorLog.update({
            where: { id },
            data: {
                out_time: new Date(),
                status: 'Checked-Out'
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PATCH Blacklist Toggle
router.patch('/profile/:id/blacklist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const profile = yield prismaClient_1.default.visitorProfile.findUnique({ where: { id } });
        if (!profile)
            return res.status(404).json({ message: 'Profile not found' });
        const updated = yield prismaClient_1.default.visitorProfile.update({
            where: { id },
            data: { is_blacklisted: !profile.is_blacklisted }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
