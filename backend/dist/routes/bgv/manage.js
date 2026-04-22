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
// GET all verifications with optional filters
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employee_name, branch_id, department_id, verification_type_id, status, is_new } = req.query;
        const where = {};
        if (employee_name) {
            where.employee = { name: { contains: String(employee_name) } };
        }
        if (branch_id)
            where.branch_id = Number(branch_id);
        if (department_id)
            where.department_id = Number(department_id);
        if (verification_type_id)
            where.verification_type_id = Number(verification_type_id);
        if (status)
            where.status = String(status);
        if (is_new === 'true') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            where.employee = Object.assign(Object.assign({}, where.employee), { createdAt: { gte: thirtyDaysAgo } });
        }
        const verifications = yield prismaClient_1.default.backgroundVerification.findMany({
            where,
            include: {
                employee: { select: { id: true, name: true, employee_grade_id: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                verificationType: { select: { id: true, name: true } },
                verifier: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(verifications);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST create verification
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employee_id, verification_type_id, verification_way, status, remarks, document_url, verified_by, verification_date } = req.body;
        if (!employee_id || !verification_type_id || !verification_way) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Get employee branch/department automatically
        const employee = yield prismaClient_1.default.user.findUnique({
            where: { id: Number(employee_id) },
            select: { branch_id: true, department_id: true }
        });
        if (!employee)
            return res.status(404).json({ message: 'Employee not found' });
        const verification = yield prismaClient_1.default.backgroundVerification.create({
            data: {
                employee_id: Number(employee_id),
                branch_id: employee.branch_id,
                department_id: employee.department_id,
                verification_type_id: Number(verification_type_id),
                verification_way: String(verification_way),
                status: status || 'Pending',
                remarks: remarks || null,
                document_url: document_url || [],
                verified_by: verified_by ? Number(verified_by) : null,
                verification_date: verification_date ? new Date(verification_date) : null
            }
        });
        res.status(201).json(verification);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PUT update verification
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { status, remarks, document_url, verified_by, verification_date } = req.body;
        const updated = yield prismaClient_1.default.backgroundVerification.update({
            where: { id },
            data: {
                status,
                remarks,
                document_url,
                verified_by: verified_by ? Number(verified_by) : null,
                verification_date: verification_date ? new Date(verification_date) : null
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// DELETE
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prismaClient_1.default.backgroundVerification.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Verification record deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
