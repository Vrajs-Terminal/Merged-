"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUnitStatus = exports.deleteUnit = exports.updateUnit = exports.createUnit = exports.getUnits = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
const getUnits = async (req, res) => {
    try {
        const units = await prisma.unitMeasure.findMany({ orderBy: { id: 'desc' } });
        res.json(units);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUnits = getUnits;
const createUnit = async (req, res) => {
    try {
        const { unitName, symbol, status } = req.body;
        const unit = await prisma.unitMeasure.create({ data: { unitName, symbol, status: status || 'Active' } });
        res.json(unit);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createUnit = createUnit;
const updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { unitName, symbol, status } = req.body;
        const updated = await prisma.unitMeasure.update({
            where: { id: Number(id) },
            data: {
                ...(unitName !== undefined ? { unitName } : {}),
                ...(symbol !== undefined ? { symbol } : {}),
                ...(status !== undefined ? { status } : {}),
            },
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateUnit = updateUnit;
const deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.unitMeasure.delete({ where: { id: Number(id) } });
        res.json({ message: 'Unit deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUnit = deleteUnit;
const toggleUnitStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await prisma.unitMeasure.findUnique({ where: { id: Number(id) } });
        if (!unit) {
            res.status(404).json({ error: 'Unit not found' });
            return;
        }
        const nextStatus = unit.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prisma.unitMeasure.update({
            where: { id: Number(id) },
            data: { status: nextStatus },
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.toggleUnitStatus = toggleUnitStatus;
//# sourceMappingURL=unitMeasureController.js.map