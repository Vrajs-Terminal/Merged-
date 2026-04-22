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
 * GET all holidays
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year, branchId, type } = req.query;
        let where = {};
        if (year) {
            const startOfYear = new Date(`${year}-01-01`);
            const endOfYear = new Date(`${year}-12-31`);
            where.date = {
                gte: startOfYear,
                lte: endOfYear
            };
        }
        if (type) {
            where.type = type;
        }
        const holidays = yield prismaClient_1.default.holiday.findMany({
            where,
            orderBy: { date: 'asc' }
        });
        // Manual filtering for branchIds stored as JSON array
        let filteredHolidays = holidays;
        if (branchId) {
            const bId = Number(branchId);
            filteredHolidays = holidays.filter((h) => {
                const bIds = h.branchIds;
                return !bIds || bIds.length === 0 || bIds.includes(bId);
            });
        }
        res.json(filteredHolidays);
    }
    catch (err) {
        console.error('Fetch Holidays Error:', err);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
}));
/**
 * POST create a new holiday
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, date, type, branchIds, description } = req.body;
        if (!name || !date || !type) {
            return res.status(400).json({ error: 'Name, Date, and Type are required' });
        }
        const holiday = yield prismaClient_1.default.holiday.create({
            data: {
                name,
                date: new Date(date),
                type,
                branchIds: branchIds || [],
                description,
                status: 'Active'
            }
        });
        res.status(201).json(holiday);
    }
    catch (err) {
        console.error('Create Holiday Error:', err);
        res.status(500).json({ error: 'Failed to create holiday' });
    }
}));
/**
 * PUT update a holiday
 */
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { name, date, type, branchIds, description, status } = req.body;
        const updated = yield prismaClient_1.default.holiday.update({
            where: { id },
            data: {
                name,
                date: date ? new Date(date) : undefined,
                type,
                branchIds,
                description,
                status
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Update Holiday Error:', err);
        res.status(500).json({ error: 'Failed to update holiday' });
    }
}));
/**
 * PATCH toggle holiday status
 */
router.patch('/:id/toggle', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const holiday = yield prismaClient_1.default.holiday.findUnique({ where: { id } });
        if (!holiday)
            return res.status(404).json({ error: 'Holiday not found' });
        const updated = yield prismaClient_1.default.holiday.update({
            where: { id },
            data: { status: holiday.status === 'Active' ? 'Inactive' : 'Active' }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Toggle Holiday Error:', err);
        res.status(500).json({ error: 'Failed to toggle holiday' });
    }
}));
/**
 * DELETE a holiday
 */
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        yield prismaClient_1.default.holiday.delete({ where: { id } });
        res.json({ message: 'Holiday deleted successfully' });
    }
    catch (err) {
        console.error('Delete Holiday Error:', err);
        res.status(500).json({ error: 'Failed to delete holiday' });
    }
}));
exports.default = router;
