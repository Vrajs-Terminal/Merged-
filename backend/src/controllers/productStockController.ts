import type { Request, Response } from 'express';
import getPrismaClient from '../config/db';

const prisma = getPrismaClient();

// Product Stocks
export const getProductStocks = async (req: Request, res: Response) => {
    try {
        const stocks = await prisma.productStock.findMany({
            include: { product: true, variant: true, distributor: true },
            orderBy: { id: 'desc' }
        });
        res.json(stocks);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createOrUpdateStock = async (req: Request, res: Response) => {
    try {
        const { productId, variantId, distributorId, availableStocks } = req.body;
        
        // This acts as an upsert logic
        const existing = await prisma.productStock.findUnique({
            where: { variantId_distributorId: { variantId, distributorId: distributorId || null } }
        });

        if (existing) {
            const updated = await prisma.productStock.update({
                where: { id: existing.id },
                data: { availableStocks: Number(availableStocks) }
            });
            res.json(updated);
        } else {
            const stock = await prisma.productStock.create({
                data: { productId, variantId, distributorId: distributorId || null, availableStocks: Number(availableStocks) }
            });
            res.json(stock);
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Stock Logs
export const getStockLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.stockLog.findMany({
            include: { product: true, variant: true, distributor: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createStockLog = async (req: Request, res: Response) => {
    try {
        const { type, quantity, performBy, orderId, productId, variantId, distributorId, stockDate, stockTime } = req.body;
        
        const log = await prisma.stockLog.create({
            data: {
                type, quantity: Number(quantity), performBy, orderId, productId, variantId, 
                distributorId: distributorId || null, 
                stockDate: stockDate ? new Date(stockDate) : new Date(),
                stockTime
            }
        });

        // Also update stock
        const factor = (type === 'Stock In' || type === 'Return') ? 1 : -1;
        const change = Number(quantity) * factor;

        const existing = await prisma.productStock.findUnique({
            where: { variantId_distributorId: { variantId, distributorId: distributorId || null } }
        });

        if (existing) {
            await prisma.productStock.update({
                where: { id: existing.id },
                data: { availableStocks: existing.availableStocks + change }
            });
        } else {
            await prisma.productStock.create({
                data: { productId, variantId, distributorId: distributorId || null, availableStocks: change > 0 ? change : 0 }
            });
        }

        res.json(log);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
