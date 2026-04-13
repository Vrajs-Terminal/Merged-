import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getExpenseSubCategories = async (req: Request, res: Response) => {
    try {
        const items = await prisma.expenseSubCategory.findMany({
            include: { category: true }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch sub categories" });
    }
};

export const createExpenseSubCategory = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const item = await prisma.expenseSubCategory.create({ data });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to create sub category" });
    }
};

export const updateExpenseSubCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = await prisma.expenseSubCategory.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to update sub category" });
    }
};

export const deleteExpenseSubCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.expenseSubCategory.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete sub category" });
    }
};
