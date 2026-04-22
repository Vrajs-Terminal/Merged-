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
// Get all Zones ordered logically
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const zones = yield prismaClient_1.default.zone.findMany({
            orderBy: { order_index: 'asc' },
            include: { branches: true }
        });
        res.json(zones);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch zones' });
    }
}));
// Bulk Create Zones
router.post('/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { names } = req.body;
    if (!names || !Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ error: 'Valid array of names is required' });
    }
    try {
        const currentMax = yield prismaClient_1.default.zone.aggregate({ _max: { order_index: true } });
        const startIndex = (currentMax._max.order_index || 0) + 1;
        const dataToInsert = names.map((name, i) => ({
            name: name.trim(),
            order_index: startIndex + i
        }));
        yield prismaClient_1.default.zone.createMany({ data: dataToInsert, skipDuplicates: true });
        const user = req.user;
        yield Promise.all(names.map((n) => (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'CREATED', 'ZONE', n.trim())));
        // Return fresh list
        const freshZones = yield prismaClient_1.default.zone.findMany({ orderBy: { order_index: 'asc' } });
        res.status(201).json(freshZones);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create zones' });
    }
}));
// Update a Zone (Edit Name)
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    if (!(name === null || name === void 0 ? void 0 : name.trim()))
        return res.status(400).json({ error: 'Name is required' });
    try {
        const updated = yield prismaClient_1.default.zone.update({
            where: { id: parseInt(id) },
            data: { name: name.trim() }
        });
        const user = req.user;
        yield (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'UPDATED', 'ZONE', updated.name);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update zone' });
    }
}));
// Bulk Reorder Zones
router.put('/action/reorder', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderedIds } = req.body;
    // Expects: [id1, id2, id3] in exact custom order
    if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'Invalid order array' });
    }
    try {
        const transaction = orderedIds.map((id, index) => prismaClient_1.default.zone.update({
            where: { id },
            data: { order_index: index }
        }));
        const user = req.user;
        yield prismaClient_1.default.$transaction(transaction);
        yield (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'REORDERED', 'ZONE', 'Reordered zones');
        const sorted = yield prismaClient_1.default.zone.findMany({ orderBy: { order_index: 'asc' } });
        res.json(sorted);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reorder zones' });
    }
}));
// Delete a Zone
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const zone = yield prismaClient_1.default.zone.findUnique({
            where: { id: parseInt(id) },
            include: { branches: true }
        });
        if (!zone)
            return res.status(404).json({ error: 'Zone not found' });
        // Safety check: Prevent deleting a Zone that currently has branches assigned to it
        if (zone.branches.length > 0) {
            return res.status(400).json({ error: 'Cannot delete a Zone containing active Branches. Reassign the branches first.' });
        }
        const user = req.user;
        yield prismaClient_1.default.zone.delete({ where: { id: parseInt(id) } });
        yield (0, activityLogger_1.logActivity)((user === null || user === void 0 ? void 0 : user.id) || null, 'DELETED', 'ZONE', zone.name);
        res.json({ message: 'Zone deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete zone' });
    }
}));
exports.default = router;
