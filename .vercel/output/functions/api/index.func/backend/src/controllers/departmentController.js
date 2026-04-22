"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkTransferDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartments = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const getDepartments = async (req, res) => {
    try {
        const items = await prismaClient_1.default.department.findMany({
            include: { _count: { select: { Employee: true } } }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch departments" });
    }
};
exports.getDepartments = getDepartments;
const createDepartment = async (req, res) => {
    var _a;
    try {
        const { departmentName, branch_id, order_index } = req.body;
        const item = await prismaClient_1.default.department.create({
            data: {
                name: departmentName,
                branch_id: Number(branch_id),
                order_index: Number(order_index || 0)
            }
        });
        await (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'CREATED', 'DEPARTMENT', departmentName, { departmentId: item.id });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create department" });
    }
};
exports.createDepartment = createDepartment;
const updateDepartment = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { departmentName, branch_id, order_index } = req.body;
        const item = await prismaClient_1.default.department.update({
            where: { id: Number(id) },
            data: {
                name: departmentName,
                branch_id: Number(branch_id),
                order_index: Number(order_index)
            }
        });
        await (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'UPDATED', 'DEPARTMENT', departmentName, { departmentId: item.id });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update department" });
    }
};
exports.updateDepartment = updateDepartment;
const bulkTransferDepartment = async (req, res) => {
    try {
        const { employeeIds, newDepartmentId, effectiveDate, remarks } = req.body;
        if (!employeeIds || !employeeIds.length || !newDepartmentId || !effectiveDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const date = new Date(effectiveDate);
        await prismaClient_1.default.$transaction(async (tx) => {
            for (const empId of employeeIds) {
                const emp = await tx.employee.findUnique({ where: { id: empId } });
                if (!emp)
                    continue;
                const oldVal = emp.departmentId || null;
                // Create history log
                await tx.employeeStructureHistory.create({
                    data: {
                        employeeId: empId,
                        transferType: 'Department',
                        oldValueId: oldVal,
                        newValueId: newDepartmentId,
                        effectiveDate: date,
                        remarks: remarks || null
                    }
                });
                // Update employee
                await tx.employee.update({
                    where: { id: empId },
                    data: { departmentId: newDepartmentId }
                });
            }
        });
        res.json({ message: "Successfully transferred employees" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to transfer employees" });
    }
};
exports.bulkTransferDepartment = bulkTransferDepartment;
//# sourceMappingURL=departmentController.js.map