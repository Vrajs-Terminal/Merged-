"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const activityLogger_1 = require("../../services/activityLogger");
const router = express_1.default.Router();
// GET /stats - Get counts per salary group
router.get('/stats', async (req, res) => {
    try {
        const groups = await prismaClient_1.default.salaryGroup.findMany({
            where: { status: 'Active' },
            include: {
                _count: {
                    select: { employeeCTCs: { where: { status: 'Current' } } }
                }
            }
        });
        res.json(groups);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});
// GET /employees - List employees with their current group
router.get('/employees', async (req, res) => {
    try {
        const { group_id } = req.query;
        const where = { status: 'Current' };
        if (group_id)
            where.salary_group_id = parseInt(group_id);
        const records = await prismaClient_1.default.employeeCTC.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, branch: { select: { name: true } } } },
                salaryGroup: { select: { id: true, name: true } }
            }
        });
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});
// POST /swipe - Bulk transition
router.post('/swipe', async (req, res) => {
    var _a;
    const { employee_ids, new_group_id, reason } = req.body;
    const admin_id = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null;
    if (!employee_ids || !new_group_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const result = await prismaClient_1.default.$transaction(async (tx) => {
            const updates = [];
            for (const empId of employee_ids) {
                // Find current CTC
                const currentCTC = await tx.employeeCTC.findFirst({
                    where: { user_id: empId, status: 'Current' }
                });
                if (currentCTC) {
                    // Log the change
                    await tx.salaryGroupChangeLog.create({
                        data: {
                            user_id: empId,
                            old_group_id: currentCTC.salary_group_id,
                            new_group_id: parseInt(new_group_id),
                            reason,
                            changed_by: admin_id
                        }
                    });
                    // Update CTC
                    await tx.employeeCTC.update({
                        where: { id: currentCTC.id },
                        data: { salary_group_id: parseInt(new_group_id) }
                    });
                    updates.push(empId);
                }
            }
            return updates;
        });
        await (0, activityLogger_1.logActivity)(admin_id, 'SWIPED', 'SALARY_GROUP', `Swiped ${result.length} employees to Group ID: ${new_group_id}`);
        res.json({ message: `Successfully swiped ${result.length} employees`, count: result.length });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Bulk transition failed" });
    }
});
// GET /logs - Transition history
router.get('/logs', async (req, res) => {
    try {
        const logs = await prismaClient_1.default.salaryGroupChangeLog.findMany({
            include: {
                user: { select: { name: true, email: true } },
                oldGroup: { select: { name: true } },
                newGroup: { select: { name: true } },
                admin: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});
exports.default = router;
//# sourceMappingURL=salary-group-swipe.js.map