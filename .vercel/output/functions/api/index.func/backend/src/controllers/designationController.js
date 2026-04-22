"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkTransferDesignation = exports.updateDesignation = exports.createDesignation = exports.getDesignations = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getDesignations = async (req, res) => {
    try {
        const items = await prismaClient_1.default.designation.findMany({
            include: { _count: { select: { users: true } } }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch designations" });
    }
};
exports.getDesignations = getDesignations;
const createDesignation = async (req, res) => {
    try {
        const { designationName, subDepartmentId } = req.body;
        if (!designationName || !subDepartmentId) {
            return res.status(400).json({ error: 'designationName and subDepartmentId are required.' });
        }
        const item = await prismaClient_1.default.designation.create({
            data: {
                name: designationName,
                sub_department_id: Number(subDepartmentId)
            }
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create designation" });
    }
};
exports.createDesignation = createDesignation;
const updateDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const { designationName, subDepartmentId } = req.body;
        const item = await prismaClient_1.default.designation.update({
            where: { id: Number(id) },
            data: {
                name: designationName,
                sub_department_id: subDepartmentId !== undefined ? Number(subDepartmentId) : undefined
            }
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update designation" });
    }
};
exports.updateDesignation = updateDesignation;
const bulkTransferDesignation = async (req, res) => {
    try {
        const { employeeIds, newDesignationId, effectiveDate, remarks } = req.body;
        if (!employeeIds || !employeeIds.length || !newDesignationId || !effectiveDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const date = new Date(effectiveDate);
        await prismaClient_1.default.$transaction(async (tx) => {
            for (const empId of employeeIds) {
                const emp = await tx.employee.findUnique({ where: { id: empId } });
                if (!emp)
                    continue;
                const oldVal = emp.designationId || null;
                // Create history log
                await tx.employeeStructureHistory.create({
                    data: {
                        employeeId: empId,
                        transferType: 'Designation',
                        oldValueId: oldVal,
                        newValueId: newDesignationId,
                        effectiveDate: date,
                        remarks: remarks || null
                    }
                });
                // Update employee
                await tx.employee.update({
                    where: { id: empId },
                    data: { designationId: newDesignationId }
                });
            }
        });
        res.json({ message: "Successfully transferred employees" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to transfer employees" });
    }
};
exports.bulkTransferDesignation = bulkTransferDesignation;
//# sourceMappingURL=designationController.js.map