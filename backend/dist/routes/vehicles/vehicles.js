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
// GET all vehicles with filters
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branch_id, department_id, category_id, user_id, status } = req.query;
        const where = {};
        if (branch_id)
            where.branchId = Number(branch_id);
        if (department_id)
            where.departmentId = Number(department_id);
        if (category_id)
            where.categoryId = Number(category_id);
        if (user_id)
            where.userId = Number(user_id);
        if (status)
            where.status = status;
        const vehicles = yield prismaClient_1.default.employeeVehicle.findMany({
            where,
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(vehicles);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// GET single vehicle by id
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vehicle = yield prismaClient_1.default.employeeVehicle.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } }
            }
        });
        if (!vehicle)
            return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// GET validate unique vehicle number
router.get('/check-number/:number', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exclude_id } = req.query;
        const where = { vehicle_number: req.params.number.toUpperCase() };
        if (exclude_id)
            where.NOT = { id: Number(exclude_id) };
        const existing = yield prismaClient_1.default.employeeVehicle.findFirst({ where });
        res.json({ exists: !!existing });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST create vehicle
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, category_id, branch_id, department_id, vehicle_name, vehicle_number, vehicle_value, image_url_1, image_url_2, image_url_3, status, assigned_date } = req.body;
        if (!user_id || !category_id || !(vehicle_name === null || vehicle_name === void 0 ? void 0 : vehicle_name.trim()) || !(vehicle_number === null || vehicle_number === void 0 ? void 0 : vehicle_number.trim())) {
            return res.status(400).json({ message: 'Employee, category, vehicle name, and vehicle number are required' });
        }
        // Unique constraint check
        const dup = yield prismaClient_1.default.employeeVehicle.findUnique({
            where: { vehicle_number: vehicle_number.trim().toUpperCase() }
        });
        if (dup)
            return res.status(409).json({ message: 'Vehicle number already exists in the system' });
        const vehicle = yield prismaClient_1.default.employeeVehicle.create({
            data: {
                userId: Number(user_id),
                categoryId: Number(category_id),
                branchId: branch_id ? Number(branch_id) : null,
                departmentId: department_id ? Number(department_id) : null,
                vehicle_name: vehicle_name.trim(),
                vehicle_number: vehicle_number.trim().toUpperCase(),
                vehicle_value: vehicle_value ? Number(vehicle_value) : 0,
                image_url_1: image_url_1 || null,
                image_url_2: image_url_2 || null,
                image_url_3: image_url_3 || null,
                status: status || 'Active',
                assigned_date: assigned_date ? new Date(assigned_date) : new Date()
            },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } }
            }
        });
        res.status(201).json(vehicle);
    }
    catch (err) {
        if (err.code === 'P2002')
            return res.status(409).json({ message: 'Vehicle number already exists' });
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PUT update vehicle
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { user_id, category_id, branch_id, department_id, vehicle_name, vehicle_number, vehicle_value, image_url_1, image_url_2, image_url_3, status, assigned_date } = req.body;
        if (!(vehicle_name === null || vehicle_name === void 0 ? void 0 : vehicle_name.trim()) || !(vehicle_number === null || vehicle_number === void 0 ? void 0 : vehicle_number.trim())) {
            return res.status(400).json({ message: 'Vehicle name and number are required' });
        }
        // Check unique number (excluding self)
        const dup = yield prismaClient_1.default.employeeVehicle.findFirst({
            where: { vehicle_number: vehicle_number.trim().toUpperCase(), NOT: { id } }
        });
        if (dup)
            return res.status(409).json({ message: 'Vehicle number already registered to another vehicle' });
        const updated = yield prismaClient_1.default.employeeVehicle.update({
            where: { id },
            data: {
                userId: Number(user_id),
                categoryId: Number(category_id),
                branchId: branch_id ? Number(branch_id) : null,
                departmentId: department_id ? Number(department_id) : null,
                vehicle_name: vehicle_name.trim(),
                vehicle_number: vehicle_number.trim().toUpperCase(),
                vehicle_value: vehicle_value ? Number(vehicle_value) : 0,
                image_url_1: image_url_1 || null,
                image_url_2: image_url_2 || null,
                image_url_3: image_url_3 || null,
                status,
                assigned_date: assigned_date ? new Date(assigned_date) : undefined
            },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } }
            }
        });
        res.json(updated);
    }
    catch (err) {
        if (err.code === 'P2002')
            return res.status(409).json({ message: 'Vehicle number already exists' });
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// DELETE vehicle
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prismaClient_1.default.employeeVehicle.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Vehicle deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
