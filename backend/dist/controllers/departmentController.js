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
exports.bulkTransferDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartments = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const getDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prismaClient_1.default.department.findMany({
            include: { _count: { select: { Employee: true } } }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch departments" });
    }
});
exports.getDepartments = getDepartments;
const createDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { departmentName, branch_id, order_index } = req.body;
        const item = yield prismaClient_1.default.department.create({
            data: {
                name: departmentName,
                branch_id: Number(branch_id),
                order_index: Number(order_index || 0)
            }
        });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'CREATED', 'DEPARTMENT', departmentName, { departmentId: item.id });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create department" });
    }
});
exports.createDepartment = createDepartment;
const updateDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { departmentName, branch_id, order_index } = req.body;
        const item = yield prismaClient_1.default.department.update({
            where: { id: Number(id) },
            data: {
                name: departmentName,
                branch_id: Number(branch_id),
                order_index: Number(order_index)
            }
        });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'UPDATED', 'DEPARTMENT', departmentName, { departmentId: item.id });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update department" });
    }
});
exports.updateDepartment = updateDepartment;
const bulkTransferDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeIds, newDepartmentId, effectiveDate, remarks } = req.body;
        if (!employeeIds || !employeeIds.length || !newDepartmentId || !effectiveDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const date = new Date(effectiveDate);
        yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            for (const empId of employeeIds) {
                const emp = yield tx.employee.findUnique({ where: { id: empId } });
                if (!emp)
                    continue;
                const oldVal = emp.departmentId || null;
                // Create history log
                yield tx.employeeStructureHistory.create({
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
                yield tx.employee.update({
                    where: { id: empId },
                    data: { departmentId: newDepartmentId }
                });
            }
        }));
        res.json({ message: "Successfully transferred employees" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to transfer employees" });
    }
});
exports.bulkTransferDepartment = bulkTransferDepartment;
