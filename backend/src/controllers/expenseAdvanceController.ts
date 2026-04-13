import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getAdvances = async (req: Request, res: Response) => {
    try {
        const advances = await prisma.expenseAdvance.findMany({
            include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(advances);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const createAdvance = async (req: Request, res: Response) => {
    try {
        const { employeeId, requestedAmount, reason } = req.body;
        const advance = await prisma.expenseAdvance.create({
            data: {
                employee: { connect: { id: Number(employeeId) } },
                requestedAmount: Number(requestedAmount),
                reason,
                status: 'Pending',
                remainingAmount: Number(requestedAmount)
            }
        });
        res.status(201).json(advance);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const approveAdvance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { approvedBy, adminRemark } = req.body;
        const adv = await prisma.expenseAdvance.findUnique({ where: { id: Number(id) } });
        if (!adv) return res.status(404).json({ error: 'Not found' });
        const updated = await prisma.expenseAdvance.update({
            where: { id: Number(id) },
            data: {
                status: 'Approved',
                approvedBy: Number(approvedBy) || 1,
                approvedAt: new Date(),
                adminRemark,
                remainingAmount: adv.requestedAmount
            }
        });
        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const rejectAdvance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { adminRemark } = req.body;
        const updated = await prisma.expenseAdvance.update({
            where: { id: Number(id) },
            data: { status: 'Rejected', adminRemark }
        });
        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const adjustAdvance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { usedAmount } = req.body;
        const adv = await prisma.expenseAdvance.findUnique({ where: { id: Number(id) } });
        if (!adv) return res.status(404).json({ error: 'Not found' });
        const newUsed = adv.usedAmount + Number(usedAmount);
        const newRemaining = Math.max(0, adv.requestedAmount - newUsed);
        const updated = await prisma.expenseAdvance.update({
            where: { id: Number(id) },
            data: { usedAmount: newUsed, remainingAmount: newRemaining }
        });
        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
