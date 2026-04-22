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
exports.toggleDistributorStatus = exports.deleteDistributor = exports.updateDistributor = exports.createDistributor = exports.getDistributor = exports.getAllDistributors = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all distributors
const getAllDistributors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 25, countryId, stateId, city, search } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (countryId)
            where.countryId = parseInt(countryId);
        if (stateId)
            where.stateId = parseInt(stateId);
        if (city)
            where.city = { contains: city };
        if (search)
            where.name = { contains: search };
        const [distributors, total] = yield Promise.all([
            prismaClient_1.default.distributor.findMany({
                where,
                skip,
                take: limitNum,
                include: { country: true, state: true },
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.distributor.count({ where })
        ]);
        res.json({
            success: true,
            data: distributors,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching distributors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch distributors' });
    }
});
exports.getAllDistributors = getAllDistributors;
// Get single distributor
const getDistributor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const distributor = yield prismaClient_1.default.distributor.findUnique({
            where: { id: parseInt(id) },
            include: { country: true, state: true, retailers: true }
        });
        if (!distributor) {
            return res.status(404).json({ success: false, message: 'Distributor not found' });
        }
        res.json({ success: true, data: distributor });
    }
    catch (error) {
        console.error('Error fetching distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch distributor' });
    }
});
exports.getDistributor = getDistributor;
// Create distributor
const createDistributor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, contactPerson, contactNumber, orderEmail, distributorEmail, countryId, stateId, city, type, status = 'Active' } = req.body;
        if (!name || !city) {
            return res.status(400).json({ success: false, message: 'Distributor name and city are required' });
        }
        const distributor = yield prismaClient_1.default.distributor.create({
            data: {
                name,
                contactPerson,
                contactNumber,
                orderEmail,
                distributorEmail,
                countryId: countryId ? parseInt(countryId) : undefined,
                stateId: stateId ? parseInt(stateId) : undefined,
                city,
                type,
                status
            },
            include: { country: true, state: true }
        });
        res.status(201).json({ success: true, data: distributor, message: 'Distributor created successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Distributor with this name and city already exists' });
        }
        console.error('Error creating distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to create distributor' });
    }
});
exports.createDistributor = createDistributor;
// Update distributor
const updateDistributor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, contactPerson, contactNumber, orderEmail, distributorEmail, countryId, stateId, city, type, status } = req.body;
        const distributor = yield prismaClient_1.default.distributor.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (contactPerson && { contactPerson })), (contactNumber && { contactNumber })), (orderEmail && { orderEmail })), (distributorEmail && { distributorEmail })), (countryId && { countryId: parseInt(countryId) })), (stateId && { stateId: parseInt(stateId) })), (city && { city })), (type && { type })), (status && { status })),
            include: { country: true, state: true }
        });
        res.json({ success: true, data: distributor, message: 'Distributor updated successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Distributor not found' });
        }
        console.error('Error updating distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to update distributor' });
    }
});
exports.updateDistributor = updateDistributor;
// Delete distributor
const deleteDistributor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.distributor.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Distributor deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Distributor not found' });
        }
        console.error('Error deleting distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to delete distributor' });
    }
});
exports.deleteDistributor = deleteDistributor;
// Toggle status
const toggleDistributorStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const distributor = yield prismaClient_1.default.distributor.findUnique({
            where: { id: parseInt(id) }
        });
        if (!distributor) {
            return res.status(404).json({ success: false, message: 'Distributor not found' });
        }
        const newStatus = distributor.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prismaClient_1.default.distributor.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, data: updated, message: 'Distributor status updated successfully' });
    }
    catch (error) {
        console.error('Error toggling distributor status:', error);
        res.status(500).json({ success: false, message: 'Failed to update distributor status' });
    }
});
exports.toggleDistributorStatus = toggleDistributorStatus;
