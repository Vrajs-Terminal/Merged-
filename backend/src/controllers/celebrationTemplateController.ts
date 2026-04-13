import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

/* GET ALL TEMPLATES */
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await prisma.celebrationTemplate.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(templates);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* CREATE TEMPLATE */
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const template = await prisma.celebrationTemplate.create({
            data: req.body,
        });
        res.status(201).json({ message: "Template created successfully", template });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to create template", error: error.message });
    }
};

/* UPDATE TEMPLATE */
export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const template = await prisma.celebrationTemplate.update({
            where: { id: parseInt(id as string) },
            data: req.body,
        });
        res.status(200).json({ message: "Template updated successfully", template });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update template", error: error.message });
    }
};

/* DELETE TEMPLATE */
export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.celebrationTemplate.delete({
            where: { id: parseInt(id as string) },
        });
        res.status(200).json({ message: "Template deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to delete template", error: error.message });
    }
};
