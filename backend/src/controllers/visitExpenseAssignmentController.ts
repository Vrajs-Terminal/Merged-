import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getVisitExpenseAssignments = async (req: Request, res: Response) => {
    try {
        const items = await prisma.visitExpenseAssignment.findMany({
            include: {
                employee: true,
                category: true,
                subCategory: true
            }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
};

export const createVisitExpenseAssignment = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const item = await prisma.visitExpenseAssignment.create({ data });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to create assignment" });
    }
};

export const updateVisitExpenseAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = await prisma.visitExpenseAssignment.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update assignment" });
    }
};

export const deleteVisitExpenseAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.visitExpenseAssignment.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete assignment" });
    }
};
