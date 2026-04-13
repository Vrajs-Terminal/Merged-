import type { Request, Response } from 'express';
import getPrismaClient from '../config/db';

const prisma = getPrismaClient();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderNo, employeeId, orderBy, retailer, distributor, city, area, amount, quantity, unit, status, location, outOfRange, outOfRangeReason, country, state, product } = req.body;
        
        const newOrder = await prisma.order.create({
            data: {
                orderNo, employeeId, orderBy, retailer, distributor, city, area, amount: Number(amount), quantity: Number(quantity), unit,
                status: status || 'Pending', location, outOfRange: outOfRange || 'No', outOfRangeReason, country, state, product
            }
        });
        
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { employee: true }
        });
        res.status(200).json(orders);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updatedOrder = await prisma.order.update({
            where: { id: Number(id) },
            data: { status }
        });
        
        res.status(200).json({ message: 'Order status updated', order: updatedOrder });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.order.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to delete order', error: error.message });
    }
};
