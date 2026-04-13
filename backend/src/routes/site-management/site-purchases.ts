import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET purchases for site
router.get('/', async (req, res) => {
    try {
        const { site_id, start_date, end_date } = req.query;

        const where: any = {};
        if (site_id) where.site_id = Number(site_id);

        if (start_date && end_date) {
             where.date = { gte: new Date(start_date as string), lte: new Date(end_date as string) };
        }

        const purchases = await prisma.sitePurchase.findMany({
            where,
            include: { site: { select: { id: true, name: true, branch: { select: { name: true } } } } },
            orderBy: { date: 'desc' }
        });

        res.status(200).json(purchases);

    } catch (error) {
        console.error('Fetch site purchases error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST add purchase
router.post('/', async (req, res) => {
    try {
        const { site_id, item_name, vendor_name, quantity, unit_price, date, bill_url, status } = req.body;

        if (!site_id || !item_name || !vendor_name || quantity === undefined || unit_price === undefined || !date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const total_amount = Number(quantity) * Number(unit_price);

        const purchase = await prisma.sitePurchase.create({
            data: {
                site_id: Number(site_id),
                item_name,
                vendor_name,
                quantity: Number(quantity),
                unit_price: Number(unit_price),
                total_amount: parseFloat(total_amount.toFixed(2)),
                date: new Date(date),
                bill_url,
                status: status || 'Approved'
            }
        });

        res.status(201).json(purchase);

    } catch (error) {
        console.error('Create site purchase error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.sitePurchase.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: 'Purchase Deleted' });
    } catch (error) {
         console.error('Delete site purchase error:', error);
         res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
