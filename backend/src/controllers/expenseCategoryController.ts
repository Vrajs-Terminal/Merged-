import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getExpenseCategories = async (req: Request, res: Response) => {
    try {
        const items = await prisma.expenseCategory.findMany({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch expense categories" });
    }
};

export const createExpenseCategory = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const item = await prisma.expenseCategory.create({ data });
        res.status(201).json(item);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create expense category" });
    }
};

export const updateExpenseCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = await prisma.expenseCategory.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update expense category" });
    }
};

export const deleteExpenseCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.expenseCategory.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete expense category" });
    }
};
