"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// Auto-generate code helper
const autoCode = () => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield prismaClient_1.default.pmsDimension.count();
    return `DIM-${String(count + 1).padStart(3, '0')}`;
});
// GET all
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, search } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (search)
            where.name = { contains: search };
        const dimensions = yield prismaClient_1.default.pmsDimension.findMany({
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
}));
// POST create
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, description, status, created_by_id } = req.body;
        if (!name)
            return res.status(400).json({ message: 'Dimension name is required' });
        const finalCode = (code === null || code === void 0 ? void 0 : code.trim()) || (yield autoCode());
        const existing = yield prismaClient_1.default.pmsDimension.findUnique({ where: { code: finalCode } });
        if (existing)
            return res.status(400).json({ message: `Code "${finalCode}" already exists` });
        const dim = yield prismaClient_1.default.pmsDimension.create({
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
}));
// PUT update
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, description, status } = req.body;
        const updated = yield prismaClient_1.default.pmsDimension.update({
            where: { id: Number(req.params.id) },
            data: { name, code, description, status }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PATCH toggle status
router.patch('/:id/toggle', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dim = yield prismaClient_1.default.pmsDimension.findUnique({ where: { id: Number(req.params.id) } });
        if (!dim)
            return res.status(404).json({ message: 'Not found' });
        const updated = yield prismaClient_1.default.pmsDimension.update({
            where: { id: dim.id },
            data: { status: dim.status === 'Active' ? 'Inactive' : 'Active' }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// DELETE
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prismaClient_1.default.pmsDimension.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Dimension deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error – may have linked evaluations' });
    }
}));
exports.default = router;
