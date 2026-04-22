"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET all assignments with filters
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, pms_type, status } = req.query;
        const where = {};
        if (branch_id)
            where.branchId = Number(branch_id);
        if (department_id)
            where.departmentId = Number(department_id);
        if (pms_type)
            where.pms_type = pms_type;
        if (status)
            where.status = status;
        const assigns = await prismaClient_1.default.pmsAssign.findMany({
            where,
            include: {
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                subGroup: { select: { id: true, name: true } },
                assignedEmployees: {
                    include: { user: { select: { id: true, name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(assigns);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// GET single assignment
router.get('/:id', async (req, res) => {
    try {
        const assign = await prismaClient_1.default.pmsAssign.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                branch: true,
                department: true,
                subGroup: { include: { dimensions: { include: { dimension: true } } } },
                assignedEmployees: { include: { user: { select: { id: true, name: true } } } }
            }
        });
        if (!assign)
            return res.status(404).json({ message: 'Assignment not found' });
        res.json(assign);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// POST create + bulk assign employees
router.post('/', async (req, res) => {
    try {
        const { pms_type, pms_date, status, description, branch_id, department_id, sub_group_id, employee_ids } = req.body;
        if (!pms_type || !pms_date) {
            return res.status(400).json({ message: 'pms_type and pms_date are required' });
        }
        if (!(employee_ids === null || employee_ids === void 0 ? void 0 : employee_ids.length)) {
            return res.status(400).json({ message: 'At least one employee must be assigned' });
        }
        const assign = await prismaClient_1.default.pmsAssign.create({
            data: {
                pms_type,
                pms_date: new Date(pms_date),
                status: status || 'Active',
                description: description || null,
                branchId: branch_id ? Number(branch_id) : null,
                departmentId: department_id ? Number(department_id) : null,
                subGroupId: sub_group_id ? Number(sub_group_id) : null,
                assignedEmployees: {
                    createMany: {
                        data: employee_ids.map((uid) => ({
                            userId: Number(uid),
                            evaluation_status: 'Pending'
                        })),
                        skipDuplicates: true
                    }
                }
            },
            include: {
                assignedEmployees: { include: { user: { select: { id: true, name: true } } } }
            }
        });
        res.status(201).json(assign);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// PUT update
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { pms_type, pms_date, status, description, branch_id, department_id, sub_group_id } = req.body;
        const updated = await prismaClient_1.default.pmsAssign.update({
            where: { id },
            data: {
                pms_type,
                pms_date: new Date(pms_date),
                status,
                description,
                branchId: branch_id ? Number(branch_id) : null,
                departmentId: department_id ? Number(department_id) : null,
                subGroupId: sub_group_id ? Number(sub_group_id) : null
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await prismaClient_1.default.pmsAssign.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Assignment deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// POST add more employees to existing assignment
router.post('/:id/employees', async (req, res) => {
    try {
        const { employee_ids } = req.body;
        await prismaClient_1.default.pmsAssignEmployee.createMany({
            data: employee_ids.map((uid) => ({
                pmsAssignId: Number(req.params.id),
                userId: Number(uid),
                evaluation_status: 'Pending'
            })),
            skipDuplicates: true
        });
        res.json({ message: 'Employees added' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// DELETE employee from assignment
router.delete('/:id/employees/:userId', async (req, res) => {
    try {
        await prismaClient_1.default.pmsAssignEmployee.deleteMany({
            where: {
                pmsAssignId: Number(req.params.id),
                userId: Number(req.params.userId)
            }
        });
        res.json({ message: 'Employee removed' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=assign.js.map