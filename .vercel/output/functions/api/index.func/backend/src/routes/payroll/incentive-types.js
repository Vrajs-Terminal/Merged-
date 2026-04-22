"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const activityLogger_1 = require("../../services/activityLogger");
const router = express_1.default.Router();
// GET / — List all incentive types
router.get('/', async (req, res) => {
    try {
        const types = await prismaClient_1.default.incentiveType.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(types);
    }
    catch (error) {
        console.error("Error fetching incentive types:", error);
        res.status(500).json({ error: "Failed to fetch incentive types" });
    }
});
// POST / — Create new incentive type
router.post('/', async (req, res) => {
    try {
        const { name, incentive_type, calculation_method, applicable_on, description } = req.body;
        if (!name || !incentive_type || !calculation_method || !applicable_on) {
            return res.status(400).json({ error: "All required fields must be filled" });
        }
        const existing = await prismaClient_1.default.incentiveType.findUnique({ where: { name } });
        if (existing) {
            return res.status(409).json({ error: `Incentive type '${name}' already exists` });
        }
        const created = await prismaClient_1.default.incentiveType.create({
            data: {
                name,
                incentive_type,
                calculation_method,
                applicable_on,
                description
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'CREATED', 'INCENTIVE_TYPE', name);
        res.status(201).json(created);
    }
    catch (error) {
        console.error("Error creating incentive type:", error);
        res.status(500).json({ error: "Failed to create incentive type" });
    }
});
// PUT /:id — Update incentive type
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, incentive_type, calculation_method, applicable_on, description, status } = req.body;
        const updated = await prismaClient_1.default.incentiveType.update({
            where: { id: parseInt(id) },
            data: {
                name,
                incentive_type,
                calculation_method,
                applicable_on,
                description,
                status
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'INCENTIVE_TYPE', name);
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating incentive type:", error);
        res.status(500).json({ error: "Failed to update incentive type" });
    }
});
// DELETE /:id — Delete incentive type
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const target = await prismaClient_1.default.incentiveType.delete({
            where: { id: parseInt(id) }
        });
        await (0, activityLogger_1.logActivity)(null, 'DELETED', 'INCENTIVE_TYPE', target.name);
        res.json({ message: "Incentive type deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting incentive type:", error);
        res.status(500).json({ error: "Failed to delete incentive type" });
    }
});
exports.default = router;
//# sourceMappingURL=incentive-types.js.map