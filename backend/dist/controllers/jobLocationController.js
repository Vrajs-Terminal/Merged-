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
exports.deleteJobLocation = exports.updateJobLocation = exports.createJobLocation = exports.getJobLocation = exports.getAllJobLocations = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all job locations
const getAllJobLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 25 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 25;
        const skip = (pageNum - 1) * limitNum;
        const [jobLocations, total] = yield Promise.all([
            prismaClient_1.default.jobLocation.findMany({
                skip,
                take: limitNum,
                include: { employee: true },
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.default.jobLocation.count()
        ]);
        // Parse countries and states
        const jobLocationsWithParsed = jobLocations.map(jl => (Object.assign(Object.assign({}, jl), { countries: jl.countries ? JSON.parse(jl.countries) : [], states: jl.states ? JSON.parse(jl.states) : [] })));
        res.json({
            success: true,
            data: jobLocationsWithParsed,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching job locations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch job locations' });
    }
});
exports.getAllJobLocations = getAllJobLocations;
// Get single job location
const getJobLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.params;
        const jobLocation = yield prismaClient_1.default.jobLocation.findUnique({
            where: { employeeId: parseInt(employeeId) },
            include: { employee: true }
        });
        if (!jobLocation) {
            return res.status(404).json({ success: false, message: 'Job location not found' });
        }
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, jobLocation), { countries: jobLocation.countries ? JSON.parse(jobLocation.countries) : [], states: jobLocation.states ? JSON.parse(jobLocation.states) : [] })
        });
    }
    catch (error) {
        console.error('Error fetching job location:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch job location' });
    }
});
exports.getJobLocation = getJobLocation;
// Create job location
const createJobLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, countries = [], states = [] } = req.body;
        if (!employeeId) {
            return res.status(400).json({ success: false, message: 'employeeId is required' });
        }
        const jobLocation = yield prismaClient_1.default.jobLocation.create({
            data: {
                employeeId: parseInt(employeeId),
                countries: JSON.stringify(countries),
                states: JSON.stringify(states)
            },
            include: { employee: true }
        });
        res.status(201).json({
            success: true,
            data: Object.assign(Object.assign({}, jobLocation), { countries: countries, states: states }),
            message: 'Job location created successfully'
        });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'Job location already exists for this employee' });
        }
        console.error('Error creating job location:', error);
        res.status(500).json({ success: false, message: 'Failed to create job location' });
    }
});
exports.createJobLocation = createJobLocation;
// Update job location
const updateJobLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.params;
        const { countries = [], states = [] } = req.body;
        const jobLocation = yield prismaClient_1.default.jobLocation.update({
            where: { employeeId: parseInt(employeeId) },
            data: {
                countries: JSON.stringify(countries),
                states: JSON.stringify(states)
            },
            include: { employee: true }
        });
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, jobLocation), { countries: countries, states: states }),
            message: 'Job location updated successfully'
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Job location not found' });
        }
        console.error('Error updating job location:', error);
        res.status(500).json({ success: false, message: 'Failed to update job location' });
    }
});
exports.updateJobLocation = updateJobLocation;
// Delete job location
const deleteJobLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.params;
        yield prismaClient_1.default.jobLocation.delete({
            where: { employeeId: parseInt(employeeId) }
        });
        res.json({ success: true, message: 'Job location deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Job location not found' });
        }
        console.error('Error deleting job location:', error);
        res.status(500).json({ success: false, message: 'Failed to delete job location' });
    }
});
exports.deleteJobLocation = deleteJobLocation;
