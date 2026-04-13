import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getFinances = async (req: Request, res: Response) => {
    try {
        const finances = await prisma.finance.findMany();
        res.status(200).json(finances);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const createFinance = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const finance = await prisma.finance.create({
            data,
        });
        res.status(201).json(finance);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getFinanceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const finance = await prisma.finance.findFirst({
            where: { employeeId: id },
        });
        if (!finance) {
            res.status(404).json({ message: "Finance record not found" });
            return;
        }
        res.status(200).json(finance);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
