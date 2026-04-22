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
exports.bulkTransferBranch = exports.updateBranch = exports.createBranch = exports.getBranches = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const getBranches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branches = yield prismaClient_1.default.branch.findMany({
            include: { _count: { select: { Employee: true } } }
        });
        res.json(branches);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch branches" });
    }
});
exports.getBranches = getBranches;
const createBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { branchName, branchCode, status } = req.body;
        const branch = yield prismaClient_1.default.branch.create({
            data: {
                name: branchName,
                code: branchCode || ''
            }
        });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'CREATED', 'BRANCH', branchName, { branchId: branch.id });
        res.status(201).json(branch);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create branch" });
    }
});
exports.createBranch = createBranch;
const updateBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { branchName, branchCode, status } = req.body;
        const branch = yield prismaClient_1.default.branch.update({
            where: { id: Number(id) },
            data: {
                name: branchName,
                code: branchCode
            }
        });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'UPDATED', 'BRANCH', branchName, { branchId: branch.id });
        res.json(branch);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update branch" });
    }
});
exports.updateBranch = updateBranch;
const bulkTransferBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeIds, newBranchId, effectiveDate, remarks } = req.body;
        if (!employeeIds || !employeeIds.length || !newBranchId || !effectiveDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const date = new Date(effectiveDate);
        yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            for (const empId of employeeIds) {
                const emp = yield tx.employee.findUnique({ where: { id: empId } });
                if (!emp)
                    continue;
                const oldVal = emp.branchId || null;
                // Create history log
                yield tx.employeeStructureHistory.create({
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
                yield tx.employee.update({
                    where: { id: empId },
                    data: { branchId: newBranchId }
                });
            }
        }));
        res.json({ message: "Successfully transferred employees" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to transfer employees" });
    }
});
exports.bulkTransferBranch = bulkTransferBranch;
