import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getLedgerTransactions = async (req: Request, res: Response) => {
    try {
        const { branchId, category, startDate, endDate, search } = req.query;
        
        const where: any = {};
        if (branchId) where.branchId = parseInt(branchId as string);
        if (category && category !== "All Accounts") where.category = category;
        
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }
        
        if (search) {
            where.OR = [
                { type: { contains: search as string } },
                { remark: { contains: search as string } },
            ];
        }

        const transactions = await prisma.ledgerTransaction.findMany({
            where,
            include: { branch: true },
            orderBy: { date: "desc" },
        });
        
        res.status(200).json(transactions);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createLedgerTransaction = async (req: Request, res: Response) => {
    try {
        const { date, type, category, branchId, amount, paymentMode, remark } = req.body;
        
        const transaction = await prisma.ledgerTransaction.create({
            data: {
                date: date ? new Date(date) : undefined,
                type,
                category,
                branchId: branchId ? parseInt(branchId) : undefined,
                amount: parseFloat(amount),
                paymentMode,
                remark,
            },
        });
        
        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteLedgerTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.ledgerTransaction.delete({
            where: { id: parseInt(id as string) },
        });
        res.status(200).json({ message: "Transaction deleted" });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
