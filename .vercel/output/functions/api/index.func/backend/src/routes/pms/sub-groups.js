"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET all sub-groups (with linked dimensions)
router.get('/', async (req, res) => {
    try {
        const subGroups = await prismaClient_1.default.pmsDimensionSubGroup.findMany({
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
});
// POST create sub-group with dimension links
router.post('/', async (req, res) => {
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
        const subGroup = await prismaClient_1.default.pmsDimensionSubGroup.create({
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
});
// PUT update sub-group — recreate dimension links
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, weightage_type, total_weightage, description, status, dimensions } = req.body;
        // Delete existing links, then recreate
        await prismaClient_1.default.pmsDimSubGroupDimension.deleteMany({ where: { subGroupId: id } });
        const updated = await prismaClient_1.default.pmsDimensionSubGroup.update({
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
});
// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await prismaClient_1.default.pmsDimensionSubGroup.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Sub-group deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=sub-groups.js.map