"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET purchases for site
router.get('/', async (req, res) => {
    try {
        const { site_id, start_date, end_date } = req.query;
        const where = {};
        if (site_id)
            where.site_id = Number(site_id);
        if (start_date && end_date) {
            where.date = { gte: new Date(start_date), lte: new Date(end_date) };
        }
        const purchases = await prismaClient_1.default.sitePurchase.findMany({
            where,
            include: { site: { select: { id: true, name: true, branch: { select: { name: true } } } } },
            orderBy: { date: 'desc' }
        });
        res.status(200).json(purchases);
    }
    catch (error) {
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
        const purchase = await prismaClient_1.default.sitePurchase.create({
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
    }
    catch (error) {
        console.error('Create site purchase error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.sitePurchase.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: 'Purchase Deleted' });
    }
    catch (error) {
        console.error('Delete site purchase error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=site-purchases.js.map