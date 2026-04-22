"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSuperDistributorStatus = exports.deleteSuperDistributor = exports.updateSuperDistributor = exports.createSuperDistributor = exports.getSuperDistributor = exports.getAllSuperDistributors = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all super distributors
const getAllSuperDistributors = async (req, res) => {
    try {
        const { page = 1, limit = 25, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search)
            where.name = { contains: search };
        const [superDistributors, total] = await Promise.all([
            prismaClient_1.default.superDistributor.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.superDistributor.count({ where })
        ]);
        res.json({
            success: true,
            data: superDistributors,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching super distributors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch super distributors' });
    }
};
exports.getAllSuperDistributors = getAllSuperDistributors;
// Get single super distributor
const getSuperDistributor = async (req, res) => {
    try {
        const { id } = req.params;
        const superDistributor = await prismaClient_1.default.superDistributor.findUnique({
            where: { id: parseInt(id) }
        });
        if (!superDistributor) {
            return res.status(404).json({ success: false, message: 'Super distributor not found' });
        }
        res.json({ success: true, data: superDistributor });
    }
    catch (error) {
        console.error('Error fetching super distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch super distributor' });
    }
};
exports.getSuperDistributor = getSuperDistributor;
// Create super distributor
const createSuperDistributor = async (req, res) => {
    try {
        const { name, contactPerson, contactNumber, orderEmail, photo, status = 'Active' } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Super distributor name is required' });
        }
        const superDistributor = await prismaClient_1.default.superDistributor.create({
            data: {
                name,
                contactPerson,
                contactNumber,
                orderEmail,
                photo,
                status
            }
        });
        res.status(201).json({ success: true, data: superDistributor, message: 'Super distributor created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Super distributor name already exists' });
        }
        console.error('Error creating super distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to create super distributor' });
    }
};
exports.createSuperDistributor = createSuperDistributor;
// Update super distributor
const updateSuperDistributor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contactPerson, contactNumber, orderEmail, photo, status } = req.body;
        const superDistributor = await prismaClient_1.default.superDistributor.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(contactPerson && { contactPerson }),
                ...(contactNumber && { contactNumber }),
                ...(orderEmail && { orderEmail }),
                ...(photo && { photo }),
                ...(status && { status })
            }
        });
        res.json({ success: true, data: superDistributor, message: 'Super distributor updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Super distributor not found' });
        }
        console.error('Error updating super distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to update super distributor' });
    }
};
exports.updateSuperDistributor = updateSuperDistributor;
// Delete super distributor
const deleteSuperDistributor = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.superDistributor.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Super distributor deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Super distributor not found' });
        }
        console.error('Error deleting super distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to delete super distributor' });
    }
};
exports.deleteSuperDistributor = deleteSuperDistributor;
// Toggle status
const toggleSuperDistributorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const superDistributor = await prismaClient_1.default.superDistributor.findUnique({
            where: { id: parseInt(id) }
        });
        if (!superDistributor) {
            return res.status(404).json({ success: false, message: 'Super distributor not found' });
        }
        const newStatus = superDistributor.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prismaClient_1.default.superDistributor.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Super distributor status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling super distributor status:', error);
        res.status(500).json({ success: false, message: 'Failed to update super distributor status' });
    }
};
exports.toggleSuperDistributorStatus = toggleSuperDistributorStatus;
//# sourceMappingURL=superDistributorController.js.map