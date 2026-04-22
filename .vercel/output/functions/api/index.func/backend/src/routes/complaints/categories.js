"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await prismaClient_1.default.complaintCategory.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// POST create category
router.post('/', async (req, res) => {
    try {
        const { name, sla_limit, status } = req.body;
        if (!name || sla_limit === undefined)
            return res.status(400).json({ message: 'Name and SLA Limit are required' });
        const category = await prismaClient_1.default.complaintCategory.create({
            data: {
                name,
                sla_limit: Number(sla_limit),
                status: status || 'Active'
            }
        });
        res.status(201).json(category);
    }
    catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Category already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// PUT update
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, sla_limit, status } = req.body;
        const updated = await prismaClient_1.default.complaintCategory.update({
            where: { id },
            data: { name, sla_limit: Number(sla_limit), status }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await prismaClient_1.default.complaintCategory.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map