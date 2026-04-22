"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.toggleTemplateStatus = exports.updateTemplate = exports.createTemplate = exports.getTemplateById = exports.getTemplates = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
/* GET ALL TEMPLATES (with Pagination and Search) */
const getTemplates = async (req, res) => {
    try {
        // Diagnostic: List tables Prisma can see
        const tables = await prismaClient_1.default.$queryRawUnsafe("SHOW TABLES");
        console.log("[DIAGNOSTIC] Tables Prisma sees:", JSON.stringify(tables));
        const { search, page = 1, limit = 25 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: String(search) } },
                { templateId: { contains: String(search) } },
                { templateType: { contains: String(search) } },
                { description: { contains: String(search) } },
            ];
        }
        const [templates, total] = await Promise.all([
            prismaClient_1.default.template.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            }),
            prismaClient_1.default.template.count({ where }),
        ]);
        res.status(200).json({
            templates,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getTemplates = getTemplates;
/* GET SINGLE TEMPLATE */
const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await prismaClient_1.default.template.findUnique({
            where: { id: Number(id) },
            include: { questions: true }
        });
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json(template);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getTemplateById = getTemplateById;
/* CREATE TEMPLATE */
const createTemplate = async (req, res) => {
    try {
        const { name, description, groupName, templateType, allowMultiplePerShift, requiredOnPunchIn, requiredOnPunchOut, needReportingPerson } = req.body;
        const template = await prismaClient_1.default.template.create({
            data: {
                name,
                description,
                groupName,
                templateType,
                allowMultiplePerShift: Boolean(allowMultiplePerShift),
                requiredOnPunchIn: Boolean(requiredOnPunchIn),
                requiredOnPunchOut: requiredOnPunchOut || "Optional",
                needReportingPerson: Boolean(needReportingPerson),
                status: "Active"
            },
        });
        res.status(201).json({ message: "Template created successfully", template });
    }
    catch (error) {
        console.error("Create Template Error:", error);
        res.status(500).json({ message: "Failed to create template", error: error.message });
    }
};
exports.createTemplate = createTemplate;
/* UPDATE TEMPLATE */
const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, groupName, templateType, allowMultiplePerShift, requiredOnPunchIn, requiredOnPunchOut, needReportingPerson } = req.body;
        const template = await prismaClient_1.default.template.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
                groupName,
                templateType,
                allowMultiplePerShift: Boolean(allowMultiplePerShift),
                requiredOnPunchIn: Boolean(requiredOnPunchIn),
                requiredOnPunchOut: requiredOnPunchOut || "Optional",
                needReportingPerson: Boolean(needReportingPerson),
            },
        });
        res.status(200).json({ message: "Template updated successfully", template });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update template", error: error.message });
    }
};
exports.updateTemplate = updateTemplate;
/* TOGGLE TEMPLATE STATUS (Hide/Unhide) */
const toggleTemplateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await prismaClient_1.default.template.findUnique({ where: { id: Number(id) } });
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }
        const updatedTemplate = await prismaClient_1.default.template.update({
            where: { id: Number(id) },
            data: { status: template.status === "Active" ? "Hidden" : "Active" },
        });
        res.status(200).json({ message: `Template ${updatedTemplate.status === "Active" ? "Unhidden" : "Hidden"} successfully`, template: updatedTemplate });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to toggle status", error: error.message });
    }
};
exports.toggleTemplateStatus = toggleTemplateStatus;
/* DELETE TEMPLATE */
const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.template.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: "Template deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete template", error: error.message });
    }
};
exports.deleteTemplate = deleteTemplate;
//# sourceMappingURL=templateController.js.map