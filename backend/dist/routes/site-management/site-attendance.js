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
// Fetch specific attendance logs
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { site_id, employee_id, start_date, end_date } = req.query;
        const where = {};
        if (site_id)
            where.siteEmployee = { site_id: Number(site_id) };
        if (employee_id)
            where.siteEmployee = Object.assign(Object.assign({}, where.siteEmployee), { user_id: Number(employee_id) });
        if (start_date && end_date) {
            where.date = { gte: new Date(start_date), lte: new Date(end_date) };
        }
        const logs = yield prismaClient_1.default.siteAttendance.findMany({
            where,
            include: {
                siteEmployee: {
                    select: { user: { select: { name: true, employeeGrade: { select: { name: true } }, designation: { select: { name: true } } } }, site: { select: { name: true } } }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.status(200).json(logs);
    }
    catch (error) {
        console.error('Fetch site attendance error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Mark / Update site attendance manully
router.post('/mark', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { site_employee_id, date, punch_in, punch_out, status, remark } = req.body;
        if (!site_employee_id || !date) {
            return res.status(400).json({ message: 'Missing core attendance parameters' });
        }
        const exactDate = new Date(date);
        // Find existing record
        const existing = yield prismaClient_1.default.siteAttendance.findUnique({
            where: { site_employee_id_date: { site_employee_id: Number(site_employee_id), date: exactDate } }
        });
        const pIn = punch_in ? new Date(punch_in) : null;
        const pOut = punch_out ? new Date(punch_out) : null;
        // Auto Calc hours
        let wh = 0.0;
        if (pIn && pOut) {
            wh = (pOut.getTime() - pIn.getTime()) / (1000 * 60 * 60);
        }
        const dataPayload = {
            site_employee_id: Number(site_employee_id),
            date: exactDate,
            punch_in: pIn,
            punch_out: pOut,
            working_hours: parseFloat(wh.toFixed(2)),
            status: status || 'Present',
            remark
        };
        let result;
        if (existing) {
            result = yield prismaClient_1.default.siteAttendance.update({
                where: { id: existing.id },
                data: dataPayload
            });
        }
        else {
            result = yield prismaClient_1.default.siteAttendance.create({
                data: dataPayload
            });
        }
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Mark site attendance error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
