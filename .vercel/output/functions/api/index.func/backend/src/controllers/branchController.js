"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkTransferBranch = exports.updateBranch = exports.createBranch = exports.getBranches = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const getBranches = async (req, res) => {
    try {
        const branches = await prismaClient_1.default.branch.findMany({
            include: { _count: { select: { Employee: true } } }
        });
        res.json(branches);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch branches" });
    }
};
exports.getBranches = getBranches;
const createBranch = async (req, res) => {
    var _a;
    try {
        const { branchName, branchCode, status } = req.body;
        const branch = await prismaClient_1.default.branch.create({
            data: {
                name: branchName,
                code: branchCode || ''
            }
        });
        await (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'CREATED', 'BRANCH', branchName, { branchId: branch.id });
        res.status(201).json(branch);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create branch" });
    }
};
exports.createBranch = createBranch;
const updateBranch = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { branchName, branchCode, status } = req.body;
        const branch = await prismaClient_1.default.branch.update({
            where: { id: Number(id) },
            data: {
                name: branchName,
                code: branchCode
            }
        });
        await (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'UPDATED', 'BRANCH', branchName, { branchId: branch.id });
        res.json(branch);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update branch" });
    }
};
exports.updateBranch = updateBranch;
const bulkTransferBranch = async (req, res) => {
    try {
        const { employeeIds, newBranchId, effectiveDate, remarks } = req.body;
        if (!employeeIds || !employeeIds.length || !newBranchId || !effectiveDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const date = new Date(effectiveDate);
        await prismaClient_1.default.$transaction(async (tx) => {
            for (const empId of employeeIds) {
                const emp = await tx.employee.findUnique({ where: { id: empId } });
                if (!emp)
                    continue;
                const oldVal = emp.branchId || null;
                // Create history log
                await tx.employeeStructureHistory.create({
                    data: {
                        employeeId: empId,
                        transferType: 'Branch',
                        oldValueId: oldVal,
                        newValueId: newBranchId,
                        effectiveDate: date,
                        remarks: remarks || null
                    }
                });
                // Update employee
                await tx.employee.update({
                    where: { id: empId },
                    data: { branchId: newBranchId }
                });
            }
        });
        res.json({ message: "Successfully transferred employees" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to transfer employees" });
    }
};
exports.bulkTransferBranch = bulkTransferBranch;
//# sourceMappingURL=branchController.js.map