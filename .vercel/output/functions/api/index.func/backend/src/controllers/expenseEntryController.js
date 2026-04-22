"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDayWise = exports.getGroupWise = exports.bulkMarkPaid = exports.markPaid = exports.rejectEntry = exports.approveEntry = exports.createEntry = exports.getEntries = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getEntries = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status)
            where.status = status;
        const entries = await prismaClient_1.default.expenseEntry.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: true, branch: true } },
                template: { select: { id: true, templateName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(entries);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
exports.getEntries = getEntries;
const createEntry = async (req, res) => {
    try {
        const { employeeId, templateId, expenseType, amount, expenseDate, description, linkWith, visitId, orderId } = req.body;
        const entry = await prismaClient_1.default.expenseEntry.create({
            data: {
                employee: { connect: { id: Number(employeeId) } },
                template: templateId ? { connect: { id: Number(templateId) } } : undefined,
                expenseType,
                amount: Number(amount),
                expenseDate: new Date(expenseDate + 'T00:00:00.000Z'),
                description,
                linkWith: linkWith || 'General',
                visitId: visitId ? Number(visitId) : null,
                orderId: orderId ? Number(orderId) : null,
                status: 'Pending'
            }
        });
        res.status(201).json(entry);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
exports.createEntry = createEntry;
const approveEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedBy } = req.body;
        const entry = await prismaClient_1.default.expenseEntry.update({
            where: { id: Number(id) },
            data: { status: 'Approved', approvedBy: Number(approvedBy) || 1, approvedAt: new Date() }
        });
        res.json(entry);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
exports.approveEntry = approveEntry;
const rejectEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectedBy, rejectionNote } = req.body;
        const entry = await prismaClient_1.default.expenseEntry.update({
            where: { id: Number(id) },
            data: { status: 'Rejected', rejectedBy: Number(rejectedBy) || 1, rejectedAt: new Date(), rejectionNote }
        });
        res.json(entry);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
exports.rejectEntry = rejectEntry;
const markPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const { paidBy, paymentMode, voucherNo } = req.body;
        const entry = await prismaClient_1.default.expenseEntry.update({
            where: { id: Number(id) },
            data: { status: 'Paid', paidBy: Number(paidBy) || 1, paidAt: new Date(), paymentMode, voucherNo }
        });
        res.json(entry);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
exports.markPaid = markPaid;
const bulkMarkPaid = async (req, res) => {
    try {
        const { ids, paymentMode, voucherNo, paidBy } = req.body;
        if (!Array.isArray(ids))
            return res.status(400).json({ error: 'ids[] required' });
        await prismaClient_1.default.expenseEntry.updateMany({
            where: { id: { in: ids.map(Number) }, status: 'Approved' },
            data: { status: 'Paid', paidBy: Number(paidBy) || 1, paidAt: new Date(), paymentMode, voucherNo }
        });
        res.json({ message: 'Marked as paid' });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
exports.bulkMarkPaid = bulkMarkPaid;
const getGroupWise = async (req, res) => {
    var _a;
    try {
        const entries = await prismaClient_1.default.expenseEntry.findMany({
            include: { employee: { select: { department: true, branch: true } } }
        });
        // Group by department
        const grouped = {};
        for (const e of entries) {
            const group = ((_a = e.employee) === null || _a === void 0 ? void 0 : _a.department) || 'Unknown';
            if (!grouped[group])
                grouped[group] = { group, total: 0, approved: 0, pending: 0, paid: 0 };
            grouped[group].total += e.amount;
            if (e.status === 'Approved')
                grouped[group].approved += e.amount;
            else if (e.status === 'Pending')
                grouped[group].pending += e.amount;
            else if (e.status === 'Paid')
                grouped[group].paid += e.amount;
        }
        res.json(Object.values(grouped));
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
exports.getGroupWise = getGroupWise;
const getDayWise = async (req, res) => {
    try {
        const entries = await prismaClient_1.default.expenseEntry.findMany({
            select: { expenseDate: true, amount: true, employeeId: true }
        });
        const byDay = {};
        for (const e of entries) {
            const day = e.expenseDate.toISOString().substring(0, 10);
            if (!byDay[day])
                byDay[day] = { date: day, total: 0, employeeSet: new Set() };
            byDay[day].total += e.amount;
            byDay[day].employeeSet.add(e.employeeId);
        }
        const result = Object.values(byDay).map((d) => ({
            date: d.date, total: d.total, employeeCount: d.employeeSet.size
        })).sort((a, b) => b.date.localeCompare(a.date));
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
exports.getDayWise = getDayWise;
//# sourceMappingURL=expenseEntryController.js.map