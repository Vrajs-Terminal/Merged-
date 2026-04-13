import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

/* GET ALL TEMPLATES (with Pagination and Search) */
export const getTemplates = async (req: Request, res: Response) => {
    try {
        // Diagnostic: List tables Prisma can see
        const tables: any = await prisma.$queryRawUnsafe("SHOW TABLES");
        console.log("[DIAGNOSTIC] Tables Prisma sees:", JSON.stringify(tables));

        const { search, page = 1, limit = 25 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: String(search) } },
                { templateId: { contains: String(search) } },
                { templateType: { contains: String(search) } },
                { description: { contains: String(search) } },
            ];
        }

        const [templates, total] = await Promise.all([
            prisma.template.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            }),
            prisma.template.count({ where }),
        ]);

        res.status(200).json({
            templates,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
        });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* GET SINGLE TEMPLATE */
export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const template = await prisma.template.findUnique({
            where: { id: Number(id) },
            include: { questions: true }
        });

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        res.status(200).json(template);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* CREATE TEMPLATE */
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            groupName,
            templateType,
            allowMultiplePerShift,
            requiredOnPunchIn,
            requiredOnPunchOut,
            needReportingPerson
        } = req.body;

        const template = await prisma.template.create({
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
    } catch (error: any) {
        console.error("Create Template Error:", error);
        res.status(500).json({ message: "Failed to create template", error: error.message });
    }
};

/* UPDATE TEMPLATE */
export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            groupName,
            templateType,
            allowMultiplePerShift,
            requiredOnPunchIn,
            requiredOnPunchOut,
            needReportingPerson
        } = req.body;

        const template = await prisma.template.update({
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
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update template", error: error.message });
    }
};

/* TOGGLE TEMPLATE STATUS (Hide/Unhide) */
export const toggleTemplateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const template = await prisma.template.findUnique({ where: { id: Number(id) } });

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        const updatedTemplate = await prisma.template.update({
            where: { id: Number(id) },
            data: { status: template.status === "Active" ? "Hidden" : "Active" },
        });

        res.status(200).json({ message: `Template ${updatedTemplate.status === "Active" ? "Unhidden" : "Hidden"} successfully`, template: updatedTemplate });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to toggle status", error: error.message });
    }
};

/* DELETE TEMPLATE */
export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.template.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: "Template deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to delete template", error: error.message });
    }
};
