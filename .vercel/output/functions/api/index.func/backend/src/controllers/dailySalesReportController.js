"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryByEmployee = exports.deleteDailySalesRecord = exports.updateDailySalesRecord = exports.createDailySalesRecord = exports.getDailySalesRecord = exports.getDailySalesReport = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get daily sales report
const getDailySalesReport = async (req, res) => {
    try {
        const { page = 1, limit = 25, employeeId, city, distributor, startDate, endDate, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (employeeId)
            where.employeeId = parseInt(employeeId);
        if (city)
            where.city = { contains: city };
        if (distributor)
            where.distributor = { contains: distributor };
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        if (search) {
            where.OR = [
                { employee: { firstName: { contains: search } } },
                { employee: { employeeId: { contains: search } } }
            ];
        }
        const [reports, total] = await Promise.all([
            prismaClient_1.default.dailySalesAggregate.findMany({
                where,
                skip,
                take: limitNum,
                include: { employee: true },
                orderBy: { date: 'desc' }
            }),
            prismaClient_1.default.dailySalesAggregate.count({ where })
        ]);
        // Calculate summary
        const summary = {
            totalOrders: reports.reduce((sum, r) => sum + r.orderCount, 0),
            totalQuantity: reports.reduce((sum, r) => sum + r.totalQuantity, 0),
            totalSalesAmount: reports.reduce((sum, r) => sum + r.salesAmount, 0)
        };
        res.json({
            success: true,
            data: reports,
            summary,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching daily sales report:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch daily sales report' });
    }
};
exports.getDailySalesReport = getDailySalesReport;
// Get single daily sales record
const getDailySalesRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await prismaClient_1.default.dailySalesAggregate.findUnique({
            where: { id: parseInt(id) },
            include: { employee: true }
        });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Daily sales record not found' });
        }
        res.json({ success: true, data: record });
    }
    catch (error) {
        console.error('Error fetching daily sales record:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch daily sales record' });
    }
};
exports.getDailySalesRecord = getDailySalesRecord;
// Create daily sales record
const createDailySalesRecord = async (req, res) => {
    try {
        const { employeeId, orderCount = 0, totalQuantity = 0, salesAmount = 0, distributor, city, date } = req.body;
        if (!employeeId || !date) {
            return res.status(400).json({ success: false, message: 'employeeId and date are required' });
        }
        const record = await prismaClient_1.default.dailySalesAggregate.create({
            data: {
                employeeId: parseInt(employeeId),
                orderCount: parseInt(orderCount),
                totalQuantity: parseInt(totalQuantity),
                salesAmount: parseFloat(salesAmount),
                distributor,
                city,
                date: new Date(date)
            },
            include: { employee: true }
        });
        res.status(201).json({ success: true, data: record, message: 'Daily sales record created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Sales record already exists for this employee on this date' });
        }
        console.error('Error creating daily sales record:', error);
        res.status(500).json({ success: false, message: 'Failed to create daily sales record' });
    }
};
exports.createDailySalesRecord = createDailySalesRecord;
// Update daily sales record
const updateDailySalesRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderCount, totalQuantity, salesAmount, distributor, city } = req.body;
        const record = await prismaClient_1.default.dailySalesAggregate.update({
            where: { id: parseInt(id) },
            data: {
                ...(orderCount !== undefined && { orderCount: parseInt(orderCount) }),
                ...(totalQuantity !== undefined && { totalQuantity: parseInt(totalQuantity) }),
                ...(salesAmount !== undefined && { salesAmount: parseFloat(salesAmount) }),
                ...(distributor && { distributor }),
                ...(city && { city })
            },
            include: { employee: true }
        });
        res.json({ success: true, data: record, message: 'Daily sales record updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Daily sales record not found' });
        }
        console.error('Error updating daily sales record:', error);
        res.status(500).json({ success: false, message: 'Failed to update daily sales record' });
    }
};
exports.updateDailySalesRecord = updateDailySalesRecord;
// Delete daily sales record
const deleteDailySalesRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.dailySalesAggregate.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Daily sales record deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Daily sales record not found' });
        }
        console.error('Error deleting daily sales record:', error);
        res.status(500).json({ success: false, message: 'Failed to delete daily sales record' });
    }
};
exports.deleteDailySalesRecord = deleteDailySalesRecord;
// Get summary by employee
const getSummaryByEmployee = async (req, res) => {
    try {
        const { employeeId, startDate, endDate } = req.query;
        const where = {};
        if (employeeId)
            where.employeeId = parseInt(employeeId);
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        const records = await prismaClient_1.default.dailySalesAggregate.findMany({
            where,
            include: { employee: true }
        });
        const summary = {
            employeeId,
            totalRecords: records.length,
            totalOrders: records.reduce((sum, r) => sum + r.orderCount, 0),
            totalQuantity: records.reduce((sum, r) => sum + r.totalQuantity, 0),
            totalSalesAmount: records.reduce((sum, r) => sum + r.salesAmount, 0),
            averageOrderAmount: records.length > 0
                ? (records.reduce((sum, r) => sum + r.salesAmount, 0) / records.length).toFixed(2)
                : 0
        };
        res.json({ success: true, data: summary });
    }
    catch (error) {
        console.error('Error calculating summary:', error);
        res.status(500).json({ success: false, message: 'Failed to calculate summary' });
    }
};
exports.getSummaryByEmployee = getSummaryByEmployee;
//# sourceMappingURL=dailySalesReportController.js.map