"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleRetailerStatus = exports.deleteRetailer = exports.updateRetailer = exports.createRetailer = exports.getRetailer = exports.getAllRetailers = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all retailers
const getAllRetailers = async (req, res) => {
    try {
        const { page = 1, limit = 25, distributorId, stateId, city, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (distributorId)
            where.distributorId = parseInt(distributorId);
        if (stateId)
            where.stateId = parseInt(stateId);
        if (city)
            where.city = { contains: city };
        if (search)
            where.name = { contains: search };
        const [retailers, total] = await Promise.all([
            prismaClient_1.default.retailer.findMany({
                where,
                skip,
                take: limitNum,
                include: { distributor: true, state: true },
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.retailer.count({ where })
        ]);
        res.json({
            success: true,
            data: retailers,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching retailers:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch retailers' });
    }
};
exports.getAllRetailers = getAllRetailers;
// Get single retailer
const getRetailer = async (req, res) => {
    try {
        const { id } = req.params;
        const retailer = await prismaClient_1.default.retailer.findUnique({
            where: { id: parseInt(id) },
            include: { distributor: true, state: true }
        });
        if (!retailer) {
            return res.status(404).json({ success: false, message: 'Retailer not found' });
        }
        res.json({ success: true, data: retailer });
    }
    catch (error) {
        console.error('Error fetching retailer:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch retailer' });
    }
};
exports.getRetailer = getRetailer;
// Create retailer
const createRetailer = async (req, res) => {
    try {
        const { name, contactNumber, distributorId, area, city, stateId, type, gst, status = 'Active' } = req.body;
        if (!name || !city || !distributorId) {
            return res.status(400).json({ success: false, message: 'Retailer name, city, and distributorId are required' });
        }
        const retailer = await prismaClient_1.default.retailer.create({
            data: {
                name,
                contactNumber,
                distributorId: parseInt(distributorId),
                area,
                city,
                stateId: stateId ? parseInt(stateId) : undefined,
                type,
                gst,
                status
            },
            include: { distributor: true, state: true }
        });
        res.status(201).json({ success: true, data: retailer, message: 'Retailer created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Retailer with this name in this distributor and city already exists' });
        }
        console.error('Error creating retailer:', error);
        res.status(500).json({ success: false, message: 'Failed to create retailer' });
    }
};
exports.createRetailer = createRetailer;
// Update retailer
const updateRetailer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contactNumber, distributorId, area, city, stateId, type, gst, status } = req.body;
        const retailer = await prismaClient_1.default.retailer.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(contactNumber && { contactNumber }),
                ...(distributorId && { distributorId: parseInt(distributorId) }),
                ...(area && { area }),
                ...(city && { city }),
                ...(stateId && { stateId: parseInt(stateId) }),
                ...(type && { type }),
                ...(gst && { gst }),
                ...(status && { status })
            },
            include: { distributor: true, state: true }
        });
        res.json({ success: true, data: retailer, message: 'Retailer updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Retailer not found' });
        }
        console.error('Error updating retailer:', error);
        res.status(500).json({ success: false, message: 'Failed to update retailer' });
    }
};
exports.updateRetailer = updateRetailer;
// Delete retailer
const deleteRetailer = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.retailer.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Retailer deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Retailer not found' });
        }
        console.error('Error deleting retailer:', error);
        res.status(500).json({ success: false, message: 'Failed to delete retailer' });
    }
};
exports.deleteRetailer = deleteRetailer;
// Toggle status
const toggleRetailerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const retailer = await prismaClient_1.default.retailer.findUnique({
            where: { id: parseInt(id) }
        });
        if (!retailer) {
            return res.status(404).json({ success: false, message: 'Retailer not found' });
        }
        const newStatus = retailer.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prismaClient_1.default.retailer.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Retailer status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling retailer status:', error);
        res.status(500).json({ success: false, message: 'Failed to update retailer status' });
    }
};
exports.toggleRetailerStatus = toggleRetailerStatus;
//# sourceMappingURL=retailerController.js.map