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
exports.toggleBeatPlanStatus = exports.deleteBeatPlan = exports.updateBeatPlan = exports.createBeatPlan = exports.getBeatPlan = exports.getAllBeatPlans = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all beat plans
const getAllBeatPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 25, employeeId, weekDay, city, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (employeeId)
            where.employeeId = parseInt(employeeId);
        if (weekDay)
            where.weekDay = weekDay;
        if (city)
            where.city = { contains: city };
        if (search) {
            where.OR = [
                { employee: { firstName: { contains: search } } },
                { employee: { employeeId: { contains: search } } }
            ];
        }
        const [beatPlans, total] = yield Promise.all([
            prismaClient_1.default.beatPlan.findMany({
                where,
                skip,
                take: limitNum,
                include: { employee: true },
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.beatPlan.count({ where })
        ]);
        res.json({
            success: true,
            data: beatPlans,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching beat plans:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch beat plans' });
    }
});
exports.getAllBeatPlans = getAllBeatPlans;
// Get single beat plan
const getBeatPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const beatPlan = yield prismaClient_1.default.beatPlan.findUnique({
            where: { id: parseInt(id) },
            include: { employee: true }
        });
        if (!beatPlan) {
            return res.status(404).json({ success: false, message: 'Beat plan not found' });
        }
        res.json({ success: true, data: beatPlan });
    }
    catch (error) {
        console.error('Error fetching beat plan:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch beat plan' });
    }
});
exports.getBeatPlan = getBeatPlan;
// Create beat plan
const createBeatPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, weekDay, retailerCount, city, status = 'Active' } = req.body;
        if (!employeeId || !weekDay) {
            return res.status(400).json({ success: false, message: 'employeeId and weekDay are required' });
        }
        const beatPlan = yield prismaClient_1.default.beatPlan.create({
            data: {
                employeeId: parseInt(employeeId),
                weekDay,
                retailerCount: retailerCount ? parseInt(retailerCount) : undefined,
                city,
                status
            },
            include: { employee: true }
        });
        res.status(201).json({ success: true, data: beatPlan, message: 'Beat plan created successfully' });
    }
    catch (error) {
        console.error('Error creating beat plan:', error);
        res.status(500).json({ success: false, message: 'Failed to create beat plan' });
    }
});
exports.createBeatPlan = createBeatPlan;
// Update beat plan
const updateBeatPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { weekDay, retailerCount, city, status } = req.body;
        const beatPlan = yield prismaClient_1.default.beatPlan.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, (weekDay && { weekDay })), (retailerCount && { retailerCount: parseInt(retailerCount) })), (city && { city })), (status && { status })),
            include: { employee: true }
        });
        res.json({ success: true, data: beatPlan, message: 'Beat plan updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Beat plan not found' });
        }
        console.error('Error updating beat plan:', error);
        res.status(500).json({ success: false, message: 'Failed to update beat plan' });
    }
});
exports.updateBeatPlan = updateBeatPlan;
// Delete beat plan
const deleteBeatPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.beatPlan.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Beat plan deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Beat plan not found' });
        }
        console.error('Error deleting beat plan:', error);
        res.status(500).json({ success: false, message: 'Failed to delete beat plan' });
    }
});
exports.deleteBeatPlan = deleteBeatPlan;
// Toggle status
const toggleBeatPlanStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const beatPlan = yield prismaClient_1.default.beatPlan.findUnique({
            where: { id: parseInt(id) }
        });
        if (!beatPlan) {
            return res.status(404).json({ success: false, message: 'Beat plan not found' });
        }
        const newStatus = beatPlan.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prismaClient_1.default.beatPlan.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Beat plan status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling beat plan status:', error);
        res.status(500).json({ success: false, message: 'Failed to update beat plan status' });
    }
});
exports.toggleBeatPlanStatus = toggleBeatPlanStatus;
