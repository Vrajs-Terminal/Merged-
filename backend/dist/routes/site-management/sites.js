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
// GET all sites
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sites = yield prismaClient_1.default.site.findMany({
            include: {
                branch: { select: { id: true, name: true, code: true } },
                department: { select: { id: true, name: true } },
                reportingManager: { select: { id: true, name: true } },
                _count: {
                    select: { siteEmployees: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(sites);
    }
    catch (error) {
        console.error('Fetch sites error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST add new site
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, contact_name, mobile_no, email, area, address, city_state, revenue_share_pct, commission_bearer, status, agreement_start, agreement_end, branch_id, department_id, reporting_manager_id, document_url } = req.body;
        // Validation
        if (!name || !contact_name || !mobile_no || !area || !branch_id || revenue_share_pct === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (Number(revenue_share_pct) < 0 || Number(revenue_share_pct) > 100) {
            return res.status(400).json({ message: 'Revenue share percentage must be between 0 and 100.' });
        }
        // Check for duplicates
        const existing = yield prismaClient_1.default.site.findUnique({
            where: {
                name_mobile_no: {
                    name,
                    mobile_no
                }
            }
        });
        if (existing) {
            return res.status(400).json({ message: 'A site with the exact same Name and Mobile combination already exists.' });
        }
        const site = yield prismaClient_1.default.site.create({
            data: {
                name,
                contact_name,
                mobile_no,
                email,
                area,
                address,
                city_state,
                revenue_share_pct: Number(revenue_share_pct),
                commission_bearer: commission_bearer || 'Company',
                status: status || 'Active',
                agreement_start: agreement_start ? new Date(agreement_start) : null,
                agreement_end: agreement_end ? new Date(agreement_end) : null,
                document_url,
                branch_id: Number(branch_id),
                department_id: department_id ? Number(department_id) : undefined,
                reporting_manager_id: reporting_manager_id ? Number(reporting_manager_id) : undefined,
            }
        });
        res.status(201).json(site);
    }
    catch (error) {
        console.error('Create site error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PUT update site
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, contact_name, mobile_no, email, area, address, city_state, revenue_share_pct, commission_bearer, status, agreement_start, agreement_end, branch_id, department_id, reporting_manager_id, document_url } = req.body;
        if (Number(revenue_share_pct) < 0 || Number(revenue_share_pct) > 100) {
            return res.status(400).json({ message: 'Revenue share percentage must be between 0 and 100.' });
        }
        const updated = yield prismaClient_1.default.site.update({
            where: { id: Number(id) },
            data: {
                name,
                contact_name,
                mobile_no,
                email,
                area,
                address,
                city_state,
                revenue_share_pct: revenue_share_pct !== undefined ? Number(revenue_share_pct) : undefined,
                commission_bearer,
                status,
                agreement_start: agreement_start ? new Date(agreement_start) : null,
                agreement_end: agreement_end ? new Date(agreement_end) : null,
                document_url,
                branch_id: branch_id ? Number(branch_id) : undefined,
                department_id: department_id ? Number(department_id) : null,
                reporting_manager_id: reporting_manager_id ? Number(reporting_manager_id) : null,
            }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error('Update site error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// DELETE site
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.site.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: 'Site permanently deleted' });
    }
    catch (error) {
        console.error('Delete site error:', error);
        res.status(500).json({ message: 'Internal Server Error - May have linked employees or data' });
    }
}));
exports.default = router;
