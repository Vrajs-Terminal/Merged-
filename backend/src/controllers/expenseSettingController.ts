import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';
import { Prisma } from "@prisma/client";

export const getExpenseSettings = async (req: Request, res: Response) => {
    try {
        const items = await prisma.expenseSetting.findMany({
            include: {
                branch: true,
                department: true
            }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch expense settings" });
    }
};

export const createExpenseSetting = async (req: Request, res: Response) => {
    try {
        const { branchId, departmentId, subDepartmentId, ...rest } = req.body;
        
        const data: Prisma.ExpenseSettingUncheckedCreateInput = {
            ...rest,
            branchId: branchId ? Number(branchId) : null,
            departmentId: departmentId ? Number(departmentId) : null,
            subDepartment: subDepartmentId ? String(subDepartmentId) : null,
        };
        
        const item = await prisma.expenseSetting.create({ data });
        res.status(201).json(item);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create expense setting" });
    }
};

export const updateExpenseSetting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { branchId, departmentId, subDepartmentId, ...rest } = req.body;
        
        const data: Prisma.ExpenseSettingUncheckedUpdateInput = {
            ...rest,
            branchId: branchId ? Number(branchId) : null,
            departmentId: departmentId ? Number(departmentId) : null,
            subDepartment: subDepartmentId ? String(subDepartmentId) : null,
        };

        const item = await prisma.expenseSetting.update({
            where: { id: Number(id) },
            data
        });
        res.json(item);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update expense setting" });
    }
};

export const deleteExpenseSetting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.expenseSetting.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete expense setting" });
    }
};
