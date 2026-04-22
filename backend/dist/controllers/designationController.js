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
exports.bulkTransferDesignation = exports.updateDesignation = exports.createDesignation = exports.getDesignations = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getDesignations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prismaClient_1.default.designation.findMany({
            include: { _count: { select: { users: true } } }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch designations" });
    }
});
exports.getDesignations = getDesignations;
const createDesignation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { designationName, subDepartmentId } = req.body;
        if (!designationName || !subDepartmentId) {
            return res.status(400).json({ error: 'designationName and subDepartmentId are required.' });
        }
        const item = yield prismaClient_1.default.designation.create({
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
});
exports.createDesignation = createDesignation;
const updateDesignation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { designationName, subDepartmentId } = req.body;
        const item = yield prismaClient_1.default.designation.update({
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
});
exports.updateDesignation = updateDesignation;
const bulkTransferDesignation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeIds, newDesignationId, effectiveDate, remarks } = req.body;
        if (!employeeIds || !employeeIds.length || !newDesignationId || !effectiveDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const date = new Date(effectiveDate);
        yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            for (const empId of employeeIds) {
                const emp = yield tx.employee.findUnique({ where: { id: empId } });
                if (!emp)
                    continue;
                const oldVal = emp.designationId || null;
                // Create history log
                yield tx.employeeStructureHistory.create({
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
                yield tx.employee.update({
                    where: { id: empId },
                    data: { designationId: newDesignationId }
                });
            }
        }));
        res.json({ message: "Successfully transferred employees" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to transfer employees" });
    }
});
exports.bulkTransferDesignation = bulkTransferDesignation;
