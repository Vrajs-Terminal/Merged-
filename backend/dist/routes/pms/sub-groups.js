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
// GET all sub-groups (with linked dimensions)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subGroups = yield prismaClient_1.default.pmsDimensionSubGroup.findMany({
            include: {
                dimensions: {
                    include: { dimension: { select: { id: true, name: true, code: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subGroups);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST create sub-group with dimension links
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, weightage_type, total_weightage, description, status, dimensions } = req.body;
        if (!name)
            return res.status(400).json({ message: 'Sub-group name is required' });
        // Validate weightage sums to 100 if Percentage
        if (weightage_type === 'Percentage' && (dimensions === null || dimensions === void 0 ? void 0 : dimensions.length)) {
            const total = dimensions.reduce((sum, d) => sum + Number(d.weightage), 0);
            if (Math.abs(total - 100) > 0.01) {
                return res.status(400).json({ message: `Dimension weightages must sum to 100% (currently ${total}%)` });
            }
        }
        const subGroup = yield prismaClient_1.default.pmsDimensionSubGroup.create({
            data: {
                name,
                weightage_type: weightage_type || 'Percentage',
                total_weightage: Number(total_weightage) || 100,
                description: description || null,
                status: status || 'Active',
                dimensions: (dimensions === null || dimensions === void 0 ? void 0 : dimensions.length) ? {
                    create: dimensions.map((d) => ({
                        dimensionId: Number(d.dimensionId),
                        weightage: Number(d.weightage) || 0
                    }))
                } : undefined
            },
            include: { dimensions: { include: { dimension: true } } }
        });
        res.status(201).json(subGroup);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// PUT update sub-group — recreate dimension links
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { name, weightage_type, total_weightage, description, status, dimensions } = req.body;
        // Delete existing links, then recreate
        yield prismaClient_1.default.pmsDimSubGroupDimension.deleteMany({ where: { subGroupId: id } });
        const updated = yield prismaClient_1.default.pmsDimensionSubGroup.update({
            where: { id },
            data: {
                name,
                weightage_type,
                total_weightage: Number(total_weightage),
                description,
                status,
                dimensions: (dimensions === null || dimensions === void 0 ? void 0 : dimensions.length) ? {
                    create: dimensions.map((d) => ({
                        dimensionId: Number(d.dimensionId),
                        weightage: Number(d.weightage) || 0
                    }))
                } : undefined
            },
            include: { dimensions: { include: { dimension: true } } }
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
        yield prismaClient_1.default.pmsDimensionSubGroup.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Sub-group deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
