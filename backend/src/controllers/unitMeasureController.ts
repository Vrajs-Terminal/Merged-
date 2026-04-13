import type { Request, Response } from 'express';
import getPrismaClient from '../config/db';

const prisma = getPrismaClient();

export const getUnits = async (req: Request, res: Response) => {
    try {
        const units = await prisma.unitMeasure.findMany({ orderBy: { id: 'desc' } });
        res.json(units);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createUnit = async (req: Request, res: Response) => {
    try {
        const { unitName, symbol, status } = req.body;
        const unit = await prisma.unitMeasure.create({ data: { unitName, symbol, status: status || 'Active' } });
        res.json(unit);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUnit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { unitName, symbol, status } = req.body;
        const updated = await prisma.unitMeasure.update({
            where: { id: Number(id) },
            data: {
                ...(unitName !== undefined ? { unitName } : {}),
                ...(symbol !== undefined ? { symbol } : {}),
                ...(status !== undefined ? { status } : {}),
            },
        });
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUnit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.unitMeasure.delete({ where: { id: Number(id) } });
        res.json({ message: 'Unit deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const toggleUnitStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const unit = await prisma.unitMeasure.findUnique({ where: { id: Number(id) } });
        if (!unit) {
            res.status(404).json({ error: 'Unit not found' });
            return;
        }

        const nextStatus = unit.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prisma.unitMeasure.update({
            where: { id: Number(id) },
            data: { status: nextStatus },
        });
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
