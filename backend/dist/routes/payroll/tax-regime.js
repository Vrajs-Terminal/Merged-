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
// GET / - fetch employee tax regimes with filters and compute summary stats
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branch_id, department_id, search, salary_type, tax_regime, financial_year } = req.query;
        const currentFY = financial_year || '2025-26';
        // Base user filter matching Active CTCs and users
        const userWhere = {
            role: { not: 'Superadmin' }
        };
        if (branch_id)
            userWhere.branch_id = parseInt(branch_id);
        if (department_id)
            userWhere.department_id = parseInt(department_id);
        if (search) {
            userWhere.OR = [
                { name: { contains: search } },
                { email: { contains: search } }
            ];
        }
        // Fetch matched users with their current CTC and tax regime for the requested FY
        let users = yield prismaClient_1.default.user.findMany({
            where: userWhere,
            select: {
                id: true,
                name: true,
                email: true,
                branch: { select: { name: true } },
                department: { select: { name: true } },
                designation: { select: { name: true } },
                employeeCTCs: {
                    where: { status: 'Current' },
                    select: { salary_type: true, gross_salary: true }
                }
            }
        });
        // We also need the tax regimes
        const userIds = users.map(u => u.id);
        const regimes = yield prismaClient_1.default.employeeTaxRegime.findMany({
            where: {
                user_id: { in: userIds },
                financial_year: currentFY
            }
        });
        const regimeMap = new Map();
        regimes.forEach(r => regimeMap.set(r.user_id, r));
        // Filter by Salary Type and Tax Regime if provided
        let processedUsers = users.map(user => {
            var _a, _b, _c;
            const regimeDetail = regimeMap.get(user.id) || {
                tax_regime: 'Not Assigned',
                metro_type: 'Non-Metro',
                declaration_status: 'Not Submitted',
                lock_status: false,
                financial_year: currentFY
            };
            const currentCtc = user.employeeCTCs[0];
            return Object.assign({ user_id: user.id, name: user.name, email: user.email, designation: ((_a = user.designation) === null || _a === void 0 ? void 0 : _a.name) || 'N/A', department: ((_b = user.department) === null || _b === void 0 ? void 0 : _b.name) || 'N/A', branch: ((_c = user.branch) === null || _c === void 0 ? void 0 : _c.name) || 'N/A', salary_type: (currentCtc === null || currentCtc === void 0 ? void 0 : currentCtc.salary_type) || 'N/A', gross_salary: (currentCtc === null || currentCtc === void 0 ? void 0 : currentCtc.gross_salary) || 0 }, regimeDetail);
        });
        if (salary_type) {
            processedUsers = processedUsers.filter(u => u.salary_type === salary_type);
        }
        if (tax_regime) {
            processedUsers = processedUsers.filter(u => u.tax_regime === tax_regime);
        }
        // Calculate stats (Summary Cards)
        const stats = {
            total: processedUsers.length,
            new_regime: processedUsers.filter(u => u.tax_regime === 'New').length,
            old_regime: processedUsers.filter(u => u.tax_regime === 'Old').length,
            not_assigned: processedUsers.filter(u => u.tax_regime === 'Not Assigned').length,
        };
        res.json({ data: processedUsers, stats });
    }
    catch (error) {
        console.error("Error fetching tax regimes:", error);
        res.status(500).json({ error: "Failed to fetch tax regimes" });
    }
}));
// PUT /bulk - Bulk update tax regimes
router.put('/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_ids, financial_year, tax_regime } = req.body;
        if (!user_ids || !Array.isArray(user_ids) || !financial_year || !tax_regime) {
            return res.status(400).json({ error: "Missing required fields for bulk update" });
        }
        const updates = user_ids.map((id) => {
            return prismaClient_1.default.employeeTaxRegime.upsert({
                where: { user_id_financial_year: { user_id: id, financial_year } },
                update: { tax_regime },
                create: {
                    user_id: id,
                    financial_year,
                    tax_regime,
                    metro_type: 'Non-Metro',
                    declaration_status: 'Not Submitted'
                }
            });
        });
        yield prismaClient_1.default.$transaction(updates);
        res.json({ message: "Bulk update successful" });
    }
    catch (error) {
        console.error("Error in bulk update tax regime:", error);
        res.status(500).json({ error: "Failed to perform bulk update" });
    }
}));
// PUT /:user_id - Update single user tax regime (used from the Side Drawer)
router.put('/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.user_id);
        const { financial_year, tax_regime, metro_type, declaration_status } = req.body;
        if (!financial_year) {
            return res.status(400).json({ error: "Financial year is required" });
        }
        const updated = yield prismaClient_1.default.employeeTaxRegime.upsert({
            where: { user_id_financial_year: { user_id: userId, financial_year } },
            update: Object.assign(Object.assign(Object.assign({}, (tax_regime && { tax_regime })), (metro_type && { metro_type })), (declaration_status && { declaration_status })),
            create: {
                user_id: userId,
                financial_year,
                tax_regime: tax_regime || 'Not Assigned',
                metro_type: metro_type || 'Non-Metro',
                declaration_status: declaration_status || 'Not Submitted'
            }
        });
        res.json({ message: "Tax regime updated successfully", data: updated });
    }
    catch (error) {
        console.error("Error updating single tax regime:", error);
        res.status(500).json({ error: "Failed to update tax regime" });
    }
}));
exports.default = router;
