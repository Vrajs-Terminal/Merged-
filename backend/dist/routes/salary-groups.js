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
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = express_1.default.Router();
// GET / — List all salary groups
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groups = yield prismaClient_1.default.salaryGroup.findMany({
            include: {
                components: {
                    include: {
                        earningDeductionType: {
                            select: { id: true, name: true, type: true }
                        }
                    }
                },
                _count: {
                    select: { components: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const result = groups.map((g) => (Object.assign(Object.assign({}, g), { earningHeads: g.components
                .filter((c) => c.earningDeductionType.type === 'Earning')
                .map((c) => c.earningDeductionType.name), deductionHeads: g.components
                .filter((c) => c.earningDeductionType.type === 'Deduction')
                .map((c) => c.earningDeductionType.name), componentCount: g._count.components })));
        res.json(result);
    }
    catch (error) {
        console.error("Error fetching salary groups:", error);
        res.status(500).json({ error: "Failed to fetch salary groups" });
    }
}));
// GET /:id — Get single salary group with full details
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const group = yield prismaClient_1.default.salaryGroup.findUnique({
            where: { id: parseInt(id) },
            include: {
                components: {
                    include: {
                        earningDeductionType: true
                    }
                }
            }
        });
        if (!group) {
            return res.status(404).json({ error: "Salary group not found" });
        }
        res.json(group);
    }
    catch (error) {
        console.error("Error fetching salary group:", error);
        res.status(500).json({ error: "Failed to fetch salary group" });
    }
}));
// POST / — Create new salary group with components
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, payroll_frequency, working_days_type, salary_calc_type, payout_formulas, slip_display_settings, common_settings, calculation_rules, incentive_settings, components } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Salary Group Name is required" });
        }
        // Check for duplicate name
        const existing = yield prismaClient_1.default.salaryGroup.findUnique({ where: { name } });
        if (existing) {
            return res.status(409).json({ error: `Salary group '${name}' already exists` });
        }
        const group = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const created = yield tx.salaryGroup.create({
                data: {
                    name,
                    payroll_frequency: payroll_frequency || 'Monthly',
                    working_days_type: working_days_type || 'Calendar Days',
                    salary_calc_type: salary_calc_type || 'Per Day',
                    payout_formulas: payout_formulas || null,
                    slip_display_settings: slip_display_settings || null,
                    common_settings: common_settings || null,
                    calculation_rules: calculation_rules || null,
                    incentive_settings: incentive_settings || null
                }
            });
            // Create components
            if (components && Array.isArray(components) && components.length > 0) {
                yield tx.salaryGroupComponent.createMany({
                    data: components.map((c) => ({
                        salary_group_id: created.id,
                        earning_deduction_type_id: c.earning_deduction_type_id,
                        amount: c.amount || 0
                    }))
                });
            }
            return yield tx.salaryGroup.findUnique({
                where: { id: created.id },
                include: {
                    components: {
                        include: { earningDeductionType: true }
                    }
                }
            });
        }));
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'SALARY_GROUP', name);
        res.status(201).json(group);
    }
    catch (error) {
        console.error("Error creating salary group:", error);
        res.status(500).json({ error: "Failed to create salary group" });
    }
}));
// PUT /:id — Update salary group and components
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, payroll_frequency, working_days_type, salary_calc_type, payout_formulas, slip_display_settings, common_settings, calculation_rules, incentive_settings, components } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Salary Group Name is required" });
        }
        // Check for duplicate name (exclude self)
        const existing = yield prismaClient_1.default.salaryGroup.findFirst({
            where: { name, NOT: { id: parseInt(id) } }
        });
        if (existing) {
            return res.status(409).json({ error: `Salary group '${name}' already exists` });
        }
        const group = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.salaryGroup.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    payroll_frequency: payroll_frequency || 'Monthly',
                    working_days_type: working_days_type || 'Calendar Days',
                    salary_calc_type: salary_calc_type || 'Per Day',
                    payout_formulas: payout_formulas || null,
                    slip_display_settings: slip_display_settings || null,
                    common_settings: common_settings || null,
                    calculation_rules: calculation_rules || null,
                    incentive_settings: incentive_settings || null
                }
            });
            // Delete old components and re-create
            yield tx.salaryGroupComponent.deleteMany({
                where: { salary_group_id: parseInt(id) }
            });
            if (components && Array.isArray(components) && components.length > 0) {
                yield tx.salaryGroupComponent.createMany({
                    data: components.map((c) => ({
                        salary_group_id: parseInt(id),
                        earning_deduction_type_id: c.earning_deduction_type_id,
                        amount: c.amount || 0
                    }))
                });
            }
            return yield tx.salaryGroup.findUnique({
                where: { id: parseInt(id) },
                include: {
                    components: {
                        include: { earningDeductionType: true }
                    }
                }
            });
        }));
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'SALARY_GROUP', name);
        res.json(group);
    }
    catch (error) {
        console.error("Error updating salary group:", error);
        res.status(500).json({ error: "Failed to update salary group" });
    }
}));
// DELETE /:id — Delete salary group
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const group = yield prismaClient_1.default.salaryGroup.delete({
            where: { id: parseInt(id) }
        });
        yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'SALARY_GROUP', group.name);
        res.json({ message: "Salary group deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting salary group:", error);
        res.status(500).json({ error: "Failed to delete salary group" });
    }
}));
// POST /:id/copy — Deep-copy a salary group
router.post('/:id/copy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const original = yield prismaClient_1.default.salaryGroup.findUnique({
            where: { id: parseInt(id) },
            include: { components: true }
        });
        if (!original) {
            return res.status(404).json({ error: "Salary group not found" });
        }
        // Generate unique name
        let copyName = `${original.name} (Copy)`;
        let counter = 1;
        while (yield prismaClient_1.default.salaryGroup.findUnique({ where: { name: copyName } })) {
            counter++;
            copyName = `${original.name} (Copy ${counter})`;
        }
        const copied = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const newGroup = yield tx.salaryGroup.create({
                data: {
                    name: copyName,
                    payroll_frequency: original.payroll_frequency,
                    working_days_type: original.working_days_type,
                    salary_calc_type: original.salary_calc_type,
                    payout_formulas: (_a = original.payout_formulas) !== null && _a !== void 0 ? _a : undefined,
                    slip_display_settings: (_b = original.slip_display_settings) !== null && _b !== void 0 ? _b : undefined,
                    common_settings: (_c = original.common_settings) !== null && _c !== void 0 ? _c : undefined,
                    calculation_rules: (_d = original.calculation_rules) !== null && _d !== void 0 ? _d : undefined,
                    incentive_settings: (_e = original.incentive_settings) !== null && _e !== void 0 ? _e : undefined
                }
            });
            if (original.components.length > 0) {
                yield tx.salaryGroupComponent.createMany({
                    data: original.components.map((c) => ({
                        salary_group_id: newGroup.id,
                        earning_deduction_type_id: c.earning_deduction_type_id,
                        amount: c.amount
                    }))
                });
            }
            return yield tx.salaryGroup.findUnique({
                where: { id: newGroup.id },
                include: {
                    components: {
                        include: { earningDeductionType: true }
                    }
                }
            });
        }));
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'SALARY_GROUP', `${copyName} (copied from ${original.name})`);
        res.status(201).json(copied);
    }
    catch (error) {
        console.error("Error copying salary group:", error);
        res.status(500).json({ error: "Failed to copy salary group" });
    }
}));
// PATCH /:id/toggle — Toggle Active/Inactive status
router.patch('/:id/toggle', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const group = yield prismaClient_1.default.salaryGroup.findUnique({
            where: { id: parseInt(id) }
        });
        if (!group) {
            return res.status(404).json({ error: "Salary group not found" });
        }
        const newStatus = group.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prismaClient_1.default.salaryGroup.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'SALARY_GROUP', `${group.name} → ${newStatus}`);
        res.json(updated);
    }
    catch (error) {
        console.error("Error toggling salary group:", error);
        res.status(500).json({ error: "Failed to toggle status" });
    }
}));
exports.default = router;
