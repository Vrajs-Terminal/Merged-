"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET all sub-types
router.get('/', async (req, res) => {
    try {
        const types = await prismaClient_1.default.visitorSubType.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(types);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// POST create sub-type
router.post('/', async (req, res) => {
    try {
        const { name, category, status } = req.body;
        if (!name || !category)
            return res.status(400).json({ message: 'Name and Category are required' });
        const type = await prismaClient_1.default.visitorSubType.create({
            data: {
                name,
                category,
                status: status || 'Active'
            }
        });
        res.status(201).json(type);
    }
    catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Visitor sub-type already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// PUT update
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, category, status } = req.body;
        const updated = await prismaClient_1.default.visitorSubType.update({
            where: { id },
            data: { name, category, status }
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
        await prismaClient_1.default.visitorSubType.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=sub-types.js.map