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
// GET all categories
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prismaClient_1.default.complaintCategory.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST create category
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, sla_limit, status } = req.body;
        if (!name || sla_limit === undefined)
            return res.status(400).json({ message: 'Name and SLA Limit are required' });
        const category = yield prismaClient_1.default.complaintCategory.create({
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
}));
// PUT update
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { name, sla_limit, status } = req.body;
        const updated = yield prismaClient_1.default.complaintCategory.update({
            where: { id },
            data: { name, sla_limit: Number(sla_limit), status }
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
        yield prismaClient_1.default.complaintCategory.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
