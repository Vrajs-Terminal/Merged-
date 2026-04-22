"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET all verification types
router.get('/', async (req, res) => {
    try {
        const types = await prismaClient_1.default.verificationType.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(types);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// POST create verification type
router.post('/', async (req, res) => {
    try {
        const { name, description, status, added_by } = req.body;
        if (!name)
            return res.status(400).json({ message: 'Name is required' });
        const type = await prismaClient_1.default.verificationType.create({
            data: {
                name,
                description: description || null,
                status: status || 'Active',
                added_by: added_by ? Number(added_by) : null
            }
        });
        res.status(201).json(type);
    }
    catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Verification type already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// PUT update verification type
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description, status } = req.body;
        const updated = await prismaClient_1.default.verificationType.update({
            where: { id },
            data: {
                name,
                description,
                status
            }
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
        await prismaClient_1.default.verificationType.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Verification type deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=verification-types.js.map