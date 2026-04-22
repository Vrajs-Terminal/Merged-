"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const activityLogger_1 = require("../../services/activityLogger");
const router = express_1.default.Router();
// GET / - List all settlements
router.get('/', async (req, res) => {
    try {
        const { user_id, status } = req.query;
        const where = {};
        if (user_id)
            where.user_id = parseInt(user_id);
        if (status)
            where.status = status;
        const records = await prismaClient_1.default.fFSettlement.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, branch: { select: { name: true } } } },
                items: true
            },
            orderBy: { last_working_day: 'desc' }
        });
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch settlements" });
    }
});
// POST / - Create draft settlement
router.post('/', async (req, res) => {
    try {
        const { user_id, last_working_day, resignation_date, items, remarks } = req.body;
        // Calculate totals
        let totalEarnings = 0;
        let totalDeductions = 0;
        const preparedItems = items.map((item) => {
            const amount = parseFloat(item.amount);
            if (item.type === 'Earning')
                totalEarnings += amount;
            else
                totalDeductions += amount;
            return {
                name: item.name,
                type: item.type,
                amount: amount,
                remarks: item.remarks
            };
        });
        const record = await prismaClient_1.default.fFSettlement.create({
            data: {
                user_id: parseInt(user_id),
                last_working_day: new Date(last_working_day),
                resignation_date: new Date(resignation_date),
                total_earnings: totalEarnings,
                total_deductions: totalDeductions,
                net_settlement: totalEarnings - totalDeductions,
                remarks,
                items: {
                    create: preparedItems
                }
            },
            include: { items: true }
        });
        await (0, activityLogger_1.logActivity)(null, 'CREATED', 'FF_SETTLEMENT', `User ID: ${user_id}, Net: ${record.net_settlement}`);
        res.status(201).json(record);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create settlement" });
    }
});
// GET /calculate/:user_id - Preview calculation
router.get('/calculate/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const { last_working_day } = req.query;
        // Fetch employee data
        const employee = await prismaClient_1.default.user.findUnique({
            where: { id: parseInt(user_id) },
            include: {
                employeeCTCs: { where: { status: 'Active' }, take: 1 },
                otherEarningsDeductions: { where: { status: 'Active' } }
            }
        });
        if (!employee)
            return res.status(404).json({ error: "Employee not found" });
        // Basic Auto-calculation logic (Draft)
        // 1. Unpaid salary for current month
        // 2. Leave encashment (Placeholder - would need leave balance)
        // 3. Gratuity (if > 5 years)
        const findings = [
            { name: 'Last Month Salary', type: 'Earning', amount: 0, remarks: 'Auto-calculated' },
            { name: 'Leave Encashment', type: 'Earning', amount: 0, remarks: 'Based on balance' },
            { name: 'Gratuity', type: 'Earning', amount: 0, remarks: 'If eligible' },
            { name: 'Notice Period Recovery', type: 'Deduction', amount: 0, remarks: 'If applicable' }
        ];
        res.json({ findings, employee });
    }
    catch (error) {
        res.status(500).json({ error: "Calculation failed" });
    }
});
// PATCH /:id/status - Update status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, settlement_date } = req.body;
        const record = await prismaClient_1.default.fFSettlement.update({
            where: { id: parseInt(id) },
            data: {
                status,
                settled_at: status === 'Settled' ? (settlement_date ? new Date(settlement_date) : new Date()) : null
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'STATUS_UPDATED', 'FF_SETTLEMENT', `ID: ${id}, Status: ${status}`);
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ error: "Status update failed" });
    }
});
exports.default = router;
//# sourceMappingURL=ff-settlement.js.map