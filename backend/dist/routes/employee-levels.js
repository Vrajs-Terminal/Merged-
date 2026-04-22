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
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get all employee levels structured as flat list (for dropdowns / tables)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const levels = yield prismaClient_1.default.employeeLevel.findMany({
            include: { parent: true },
            orderBy: [{ parent_id: 'asc' }, { order_index: 'asc' }]
        });
        res.json(levels);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee levels' });
    }
}));
// Build a hierarchy tree recursively
// Helper function to build tree
const buildTree = (levels, parentId = null) => {
    return levels
        .filter(level => level.parent_id === parentId)
        .sort((a, b) => a.order_index - b.order_index)
        .map(level => (Object.assign(Object.assign({}, level), { children: buildTree(levels, level.id) })));
};
// Get Employee hierarchy tree
router.get('/hierarchy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const levels = yield prismaClient_1.default.employeeLevel.findMany({
            orderBy: { order_index: 'asc' }
        });
        const tree = buildTree(levels);
        res.json(tree);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to build hierarchy' });
    }
}));
// Create Employee Level
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, parent_id } = req.body;
    if (!name)
        return res.status(400).json({ error: 'Name is required' });
    try {
        const maxOrder = yield prismaClient_1.default.employeeLevel.aggregate({
            where: { parent_id: parent_id || null },
            _max: { order_index: true }
        });
        const newOrder = ((_a = maxOrder._max.order_index) !== null && _a !== void 0 ? _a : 0) + 1;
        const level = yield prismaClient_1.default.employeeLevel.create({
            data: {
                name,
                parent_id: parent_id || null,
                order_index: newOrder
            },
            include: { parent: true }
        });
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'EMPLOYEE_LEVEL', level.name);
        res.status(201).json(level);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create level' });
    }
}));
// Prevent circular dependency helper
const isCircular = (targetId, proposedParentId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!proposedParentId)
        return false;
    if (targetId === proposedParentId)
        return true;
    let currentParent = yield prismaClient_1.default.employeeLevel.findUnique({ where: { id: proposedParentId } });
    while (currentParent === null || currentParent === void 0 ? void 0 : currentParent.parent_id) {
        if (currentParent.parent_id === targetId)
            return true;
        currentParent = yield prismaClient_1.default.employeeLevel.findUnique({ where: { id: currentParent.parent_id } });
    }
    return false;
});
// Update Employee Level
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, parent_id } = req.body;
    try {
        if (parent_id) {
            const circular = yield isCircular(Number(id), Number(parent_id));
            if (circular) {
                return res.status(400).json({ error: 'Circular hierarchy loop detected. A level cannot be a child of its own children.' });
            }
        }
        const level = yield prismaClient_1.default.employeeLevel.update({
            where: { id: Number(id) },
            data: { name, parent_id: parent_id || null },
            include: { parent: true }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'EMPLOYEE_LEVEL', level.name);
        res.json(level);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update level' });
    }
}));
// Delete Employee Level
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const children = yield prismaClient_1.default.employeeLevel.count({ where: { parent_id: Number(id) } });
        if (children > 0) {
            return res.status(400).json({ error: 'Cannot delete level because it has child levels. Please reassign or delete children first.' });
        }
        yield prismaClient_1.default.employeeLevel.delete({ where: { id: Number(id) } });
        yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'EMPLOYEE_LEVEL', `Level #${id}`);
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete level' });
    }
}));
exports.default = router;
