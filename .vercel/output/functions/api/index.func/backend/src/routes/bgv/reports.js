"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET BGV Reports Summary
router.get('/summary', async (req, res) => {
    try {
        const total = await prismaClient_1.default.backgroundVerification.count();
        const verified = await prismaClient_1.default.backgroundVerification.count({ where: { status: 'Verified' } });
        const pending = await prismaClient_1.default.backgroundVerification.count({ where: { status: 'Pending' } });
        const failed = await prismaClient_1.default.backgroundVerification.count({ where: { status: 'Failed' } });
        res.json({
            total,
            verified,
            pending,
            failed
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// GET BGV History for reports with all filters
router.get('/history', async (req, res) => {
    try {
        const { employee_id, branch_id, department_id, verification_type_id, status, start_date, end_date } = req.query;
        const where = {};
        if (employee_id)
            where.employee_id = Number(employee_id);
        if (branch_id)
            where.branch_id = Number(branch_id);
        if (department_id)
            where.department_id = Number(department_id);
        if (verification_type_id)
            where.verification_type_id = Number(verification_type_id);
        if (status)
            where.status = String(status);
        if (start_date || end_date) {
            where.createdAt = {};
            if (start_date)
                where.createdAt.gte = new Date(String(start_date));
            if (end_date)
                where.createdAt.lte = new Date(String(end_date));
        }
        const reports = await prismaClient_1.default.backgroundVerification.findMany({
            where,
            include: {
                employee: { select: { name: true, branch: { select: { name: true } }, department: { select: { name: true } } } },
                verificationType: { select: { name: true } },
                verifier: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map