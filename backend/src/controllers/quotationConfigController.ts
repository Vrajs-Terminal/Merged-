import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getQuotationConfigs = async (req: Request, res: Response) => {
    try {
        const configs = await prisma.quotationColumnConfig.findMany({
            orderBy: { sequence: "asc" },
        });
        res.status(200).json(configs);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateQuotationConfigs = async (req: Request, res: Response) => {
    try {
        const { columns } = req.body; // Array of configs
        
        const updates = columns.map((col: any) => 
            prisma.quotationColumnConfig.upsert({
                where: { columnName: col.columnName },
                update: {
                    visible: col.visible,
                    sequence: col.sequence,
                    customLabel: col.customLabel,
                },
                create: {
                    columnName: col.columnName,
                    visible: col.visible,
                    sequence: col.sequence,
                    customLabel: col.customLabel,
                },
            })
        );
        
        await prisma.$transaction(updates);
        res.status(200).json({ message: "Configuration updated successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
