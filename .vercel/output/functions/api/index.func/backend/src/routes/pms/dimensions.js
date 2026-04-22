"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// Auto-generate code helper
const autoCode = async () => {
    const count = await prismaClient_1.default.pmsDimension.count();
    return `DIM-${String(count + 1).padStart(3, '0')}`;
};
// GET all
router.get('/', async (req, res) => {
    try {
        const { status, search } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (search)
            where.name = { contains: search };
        const dimensions = await prismaClient_1.default.pmsDimension.findMany({
            where,
            include: { createdBy: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(dimensions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// POST create
router.post('/', async (req, res) => {
    try {
        const { name, code, description, status, created_by_id } = req.body;
        if (!name)
            return res.status(400).json({ message: 'Dimension name is required' });
        const finalCode = (code === null || code === void 0 ? void 0 : code.trim()) || await autoCode();
        const existing = await prismaClient_1.default.pmsDimension.findUnique({ where: { code: finalCode } });
        if (existing)
            return res.status(400).json({ message: `Code "${finalCode}" already exists` });
        const dim = await prismaClient_1.default.pmsDimension.create({
            data: {
                name,
                code: finalCode,
                description: description || null,
                status: status || 'Active',
                createdById: created_by_id ? Number(created_by_id) : null
            }
        });
        res.status(201).json(dim);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// PUT update
router.put('/:id', async (req, res) => {
    try {
        const { name, code, description, status } = req.body;
        const updated = await prismaClient_1.default.pmsDimension.update({
            where: { id: Number(req.params.id) },
            data: { name, code, description, status }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// PATCH toggle status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const dim = await prismaClient_1.default.pmsDimension.findUnique({ where: { id: Number(req.params.id) } });
        if (!dim)
            return res.status(404).json({ message: 'Not found' });
        const updated = await prismaClient_1.default.pmsDimension.update({
            where: { id: dim.id },
            data: { status: dim.status === 'Active' ? 'Inactive' : 'Active' }
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
        await prismaClient_1.default.pmsDimension.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Dimension deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error – may have linked evaluations' });
    }
});
exports.default = router;
//# sourceMappingURL=dimensions.js.map