"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET /global-rules/:financial_year
router.get('/global-rules/:financial_year', async (req, res) => {
    try {
        const { financial_year } = req.params;
        let rule = await prismaClient_1.default.tdsGlobalRule.findUnique({
            where: { financial_year }
        });
        if (!rule) {
            // Provide intelligent defaults
            rule = await prismaClient_1.default.tdsGlobalRule.create({
                data: {
                    financial_year,
                    min_ctc_new_regime: 1200000,
                    min_ctc_old_regime: 500000,
                    default_cycle: 'Monthly',
                    auto_apply_ctc_rules: true
                }
            });
        }
        res.json(rule);
    }
    catch (error) {
        console.error("Error fetching TDS global rule:", error);
        res.status(500).json({ error: "Failed to fetch global rules" });
    }
});
// PUT /global-rules/:financial_year
router.put('/global-rules/:financial_year', async (req, res) => {
    try {
        const { financial_year } = req.params;
        const { min_ctc_new_regime, min_ctc_old_regime, default_cycle, auto_apply_ctc_rules } = req.body;
        const updated = await prismaClient_1.default.tdsGlobalRule.upsert({
            where: { financial_year },
            update: {
                min_ctc_new_regime: parseFloat(min_ctc_new_regime),
                min_ctc_old_regime: parseFloat(min_ctc_old_regime),
                default_cycle,
                auto_apply_ctc_rules
            },
            create: {
                financial_year,
                min_ctc_new_regime: parseFloat(min_ctc_new_regime),
                min_ctc_old_regime: parseFloat(min_ctc_old_regime),
                default_cycle,
                auto_apply_ctc_rules
            }
        });
        res.json({ message: "Global rules updated successfully", data: updated });
    }
    catch (error) {
        console.error("Error updating global rules:", error);
        res.status(500).json({ error: "Failed to update global rules" });
    }
});
// GET /employee-rules - List employee TDS setting
router.get('/employee-rules', async (req, res) => {
    try {
        const { branch_id, department_id, search, min_ctc, max_ctc, financial_year } = req.query;
        const currentFY = financial_year || '2025-26';
        // Filters matching
        const userWhere = { role: { not: 'Superadmin' } };
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
        // Fetch matched users, their CTC (annualized), and tax regime
        let users = await prismaClient_1.default.user.findMany({
            where: userWhere,
            select: {
                id: true,
                name: true,
                email: true,
                branch: { select: { name: true } },
                department: { select: { name: true } },
                employeeCTCs: {
                    where: { status: 'Current' },
                    select: { gross_salary: true, salary_type: true }
                }
            }
        });
        const userIds = users.map(u => u.id);
        const [regimes, tdsRules] = await Promise.all([
            prismaClient_1.default.employeeTaxRegime.findMany({ where: { user_id: { in: userIds }, financial_year: currentFY } }),
            prismaClient_1.default.employeeTdsRule.findMany({ where: { user_id: { in: userIds }, financial_year: currentFY } })
        ]);
        const regimeMap = new Map();
        regimes.forEach(r => regimeMap.set(r.user_id, r));
        const tdsRuleMap = new Map();
        tdsRules.forEach(t => tdsRuleMap.set(t.user_id, t));
        let totalTds = 0;
        let notConfiguredCnt = 0;
        let noTdsCnt = 0;
        let processedUsers = users.map(user => {
            var _a;
            const currentCtc = user.employeeCTCs[0];
            let annualCTC = 0;
            if (currentCtc) {
                // Approximate annual CTC if it's Monthly
                annualCTC = currentCtc.salary_type === 'Fixed Per Month' ? currentCtc.gross_salary * 12 : currentCtc.gross_salary;
            }
            const regimeObj = regimeMap.get(user.id);
            const tdsObj = tdsRuleMap.get(user.id);
            const taxRegime = regimeObj ? regimeObj.tax_regime : 'Not Assigned';
            const ruleDetail = tdsObj || {
                deduction_rule: 'Not Set',
                status: 'Not Configured',
                estimated_yearly_tds: 0
            };
            // Heuristics for Stats
            if (ruleDetail.status === 'Not Configured')
                notConfiguredCnt++;
            if (annualCTC < 500000)
                noTdsCnt++;
            totalTds += ruleDetail.estimated_yearly_tds;
            return {
                user_id: user.id,
                name: user.name,
                email: user.email,
                department: ((_a = user.department) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                annual_ctc: annualCTC,
                tax_regime: taxRegime,
                deduction_rule: ruleDetail.deduction_rule,
                status: ruleDetail.status,
                estimated_yearly_tds: ruleDetail.estimated_yearly_tds
            };
        });
        // Range filters for CTC
        if (min_ctc && max_ctc) {
            const minC = parseFloat(min_ctc);
            const maxC = parseFloat(max_ctc);
            processedUsers = processedUsers.filter(u => u.annual_ctc >= minC && u.annual_ctc <= maxC);
        }
        const stats = {
            total: processedUsers.length,
            monthly_tds: totalTds / 12, // Approximate
            low_ctc: noTdsCnt,
            rule_missing: notConfiguredCnt
        };
        res.json({ data: processedUsers, stats });
    }
    catch (error) {
        console.error("Error fetching employee TDS rules:", error);
        res.status(500).json({ error: "Failed to fetch employee TDS rules" });
    }
});
// PUT /employee-rules/bulk - Bulk update
router.put('/employee-rules/bulk', async (req, res) => {
    try {
        const { user_ids, financial_year, deduction_rule } = req.body;
        if (!user_ids || !Array.isArray(user_ids) || !financial_year || !deduction_rule) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const updates = user_ids.map((id) => {
            return prismaClient_1.default.employeeTdsRule.upsert({
                where: { user_id_financial_year: { user_id: id, financial_year } },
                update: { deduction_rule, status: 'Active' },
                create: {
                    user_id: id,
                    financial_year,
                    deduction_rule,
                    status: 'Active'
                }
            });
        });
        await prismaClient_1.default.$transaction(updates);
        res.json({ message: "Bulk update successful" });
    }
    catch (error) {
        console.error("Error in bulk update TDS rule:", error);
        res.status(500).json({ error: "Failed to perform bulk update" });
    }
});
// PUT /employee-rules/:user_id
router.put('/employee-rules/:user_id', async (req, res) => {
    try {
        const userId = parseInt(req.params.user_id);
        const { financial_year, deduction_rule, estimated_yearly_tds } = req.body;
        const updated = await prismaClient_1.default.employeeTdsRule.upsert({
            where: { user_id_financial_year: { user_id: userId, financial_year } },
            update: {
                ...(deduction_rule && { deduction_rule }),
                ...(estimated_yearly_tds !== undefined && { estimated_yearly_tds }),
                status: 'Active'
            },
            create: {
                user_id: userId,
                financial_year,
                deduction_rule: deduction_rule || 'Monthly',
                estimated_yearly_tds: estimated_yearly_tds || 0,
                status: 'Active'
            }
        });
        res.json({ message: "TDS rule updated successfully", data: updated });
    }
    catch (error) {
        console.error("Error updating single TDS rule:", error);
        res.status(500).json({ error: "Failed to update TDS rule" });
    }
});
exports.default = router;
//# sourceMappingURL=tds-rules.js.map