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
exports.deleteAssignment = exports.getAssignments = exports.assignTemplate = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templates = yield prismaClient_1.default.expenseTemplate.findMany({
            include: { assignments: { include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(templates);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.getTemplates = getTemplates;
const createTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { templateName, description, expenseTypes, status } = req.body;
        const template = yield prismaClient_1.default.expenseTemplate.create({
            data: { templateName, description, expenseTypes: expenseTypes || [], status: status || 'Active' }
        });
        res.status(201).json(template);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.createTemplate = createTemplate;
const updateTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { templateName, description, expenseTypes, status } = req.body;
        const template = yield prismaClient_1.default.expenseTemplate.update({
            where: { id: Number(id) },
            data: { templateName, description, expenseTypes: expenseTypes || [], status }
        });
        res.json(template);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.updateTemplate = updateTemplate;
const deleteTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.expenseTemplate.delete({ where: { id: Number(id) } });
        res.json({ message: 'Deleted' });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.deleteTemplate = deleteTemplate;
const assignTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { templateId, employeeIds, department, branch } = req.body;
        if (!templateId)
            return res.status(400).json({ error: 'templateId required' });
        const created = [];
        yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            if (Array.isArray(employeeIds) && employeeIds.length > 0) {
                for (const empId of employeeIds) {
                    const rec = yield tx.expenseTemplateAssignment.create({
                        data: { templateId: Number(templateId), employeeId: Number(empId), department: department || null, branch: branch || null }
                    });
                    created.push(rec);
                }
            }
            else {
                const rec = yield tx.expenseTemplateAssignment.create({
                    data: { templateId: Number(templateId), department: department || null, branch: branch || null }
                });
                created.push(rec);
            }
        }));
        res.status(201).json({ message: 'Assigned successfully', count: created.length });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.assignTemplate = assignTemplate;
const getAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assignments = yield prismaClient_1.default.expenseTemplateAssignment.findMany({
            include: {
                template: true,
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: true, branch: true } }
            },
            orderBy: { assignedAt: 'desc' }
        });
        res.json(assignments);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.getAssignments = getAssignments;
const deleteAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.expenseTemplateAssignment.delete({ where: { id: Number(id) } });
        res.json({ message: 'Assignment removed' });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.deleteAssignment = deleteAssignment;
