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
exports.toggleUnitStatus = exports.deleteUnit = exports.updateUnit = exports.createUnit = exports.getUnits = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
const getUnits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const units = yield prisma.unitMeasure.findMany({ orderBy: { id: 'desc' } });
        res.json(units);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getUnits = getUnits;
const createUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { unitName, symbol, status } = req.body;
        const unit = yield prisma.unitMeasure.create({ data: { unitName, symbol, status: status || 'Active' } });
        res.json(unit);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.createUnit = createUnit;
const updateUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { unitName, symbol, status } = req.body;
        const updated = yield prisma.unitMeasure.update({
            where: { id: Number(id) },
            data: Object.assign(Object.assign(Object.assign({}, (unitName !== undefined ? { unitName } : {})), (symbol !== undefined ? { symbol } : {})), (status !== undefined ? { status } : {})),
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateUnit = updateUnit;
const deleteUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.unitMeasure.delete({ where: { id: Number(id) } });
        res.json({ message: 'Unit deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.deleteUnit = deleteUnit;
const toggleUnitStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const unit = yield prisma.unitMeasure.findUnique({ where: { id: Number(id) } });
        if (!unit) {
            res.status(404).json({ error: 'Unit not found' });
            return;
        }
        const nextStatus = unit.status === 'Active' ? 'Inactive' : 'Active';
        const updated = yield prisma.unitMeasure.update({
            where: { id: Number(id) },
            data: { status: nextStatus },
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.toggleUnitStatus = toggleUnitStatus;
