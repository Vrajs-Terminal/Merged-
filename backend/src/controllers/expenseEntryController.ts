import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getEntries = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const where: any = {};
        if (status) where.status = status as string;

        const entries = await prisma.expenseEntry.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: true, branch: true } },
                template: { select: { id: true, templateName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(entries);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const createEntry = async (req: Request, res: Response) => {
    try {
        const { employeeId, templateId, expenseType, amount, expenseDate, description, linkWith, visitId, orderId } = req.body;
        const entry = await prisma.expenseEntry.create({
            data: {
                employee: { connect: { id: Number(employeeId) } },
                template: templateId ? { connect: { id: Number(templateId) } } : undefined,
                expenseType,
                amount: Number(amount),
                expenseDate: new Date(expenseDate + 'T00:00:00.000Z'),
                description,
                linkWith: linkWith || 'General',
                visitId: visitId ? Number(visitId) : null,
                orderId: orderId ? Number(orderId) : null,
                status: 'Pending'
            }
        });
        res.status(201).json(entry);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const approveEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { approvedBy } = req.body;
        const entry = await prisma.expenseEntry.update({
            where: { id: Number(id) },
            data: { status: 'Approved', approvedBy: Number(approvedBy) || 1, approvedAt: new Date() }
        });
        res.json(entry);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const rejectEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rejectedBy, rejectionNote } = req.body;
        const entry = await prisma.expenseEntry.update({
            where: { id: Number(id) },
            data: { status: 'Rejected', rejectedBy: Number(rejectedBy) || 1, rejectedAt: new Date(), rejectionNote }
        });
        res.json(entry);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const markPaid = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { paidBy, paymentMode, voucherNo } = req.body;
        const entry = await prisma.expenseEntry.update({
            where: { id: Number(id) },
            data: { status: 'Paid', paidBy: Number(paidBy) || 1, paidAt: new Date(), paymentMode, voucherNo }
        });
        res.json(entry);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const bulkMarkPaid = async (req: Request, res: Response) => {
    try {
        const { ids, paymentMode, voucherNo, paidBy } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids[] required' });
        await prisma.expenseEntry.updateMany({
            where: { id: { in: ids.map(Number) }, status: 'Approved' },
            data: { status: 'Paid', paidBy: Number(paidBy) || 1, paidAt: new Date(), paymentMode, voucherNo }
        });
        res.json({ message: 'Marked as paid' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getGroupWise = async (req: Request, res: Response) => {
    try {
        const entries = await prisma.expenseEntry.findMany({
            include: { employee: { select: { department: true, branch: true } } }
        });
        // Group by department
        const grouped: Record<string, any> = {};
        for (const e of entries) {
            const group = e.employee?.department || 'Unknown';
            if (!grouped[group]) grouped[group] = { group, total: 0, approved: 0, pending: 0, paid: 0 };
            grouped[group].total += e.amount;
            if (e.status === 'Approved') grouped[group].approved += e.amount;
            else if (e.status === 'Pending') grouped[group].pending += e.amount;
            else if (e.status === 'Paid') grouped[group].paid += e.amount;
        }
        res.json(Object.values(grouped));
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getDayWise = async (req: Request, res: Response) => {
    try {
        const entries = await prisma.expenseEntry.findMany({
            select: { expenseDate: true, amount: true, employeeId: true }
        });
        const byDay: Record<string, any> = {};
        for (const e of entries) {
            const day = e.expenseDate.toISOString().substring(0, 10);
            if (!byDay[day]) byDay[day] = { date: day, total: 0, employeeSet: new Set() };
            byDay[day].total += e.amount;
            byDay[day].employeeSet.add(e.employeeId);
        }
        const result = Object.values(byDay).map((d: any) => ({
            date: d.date, total: d.total, employeeCount: d.employeeSet.size
        })).sort((a: any, b: any) => b.date.localeCompare(a.date));
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
