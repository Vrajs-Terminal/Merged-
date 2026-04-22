"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = express_1.default.Router();
// Get all Parking Slots
router.get('/', async (req, res) => {
    try {
        const slots = await prismaClient_1.default.parkingSlot.findMany({
            include: {
                user: {
                    select: { id: true, name: true } // Only return needed user fields
                }
            },
            orderBy: {
                slot_number: 'asc'
            }
        });
        res.json(slots);
    }
    catch (error) {
        console.error("Error fetching parking slots:", error);
        res.status(500).json({ error: "Failed to fetch parking slots" });
    }
});
// Create a new Parking Slot
router.post('/', async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const { slot_number, user_id, vehicle_number, access_type, status } = req.body;
        if (!slot_number) {
            return res.status(400).json({ error: "Slot number is required" });
        }
        const newSlot = await prismaClient_1.default.parkingSlot.create({
            data: {
                slot_number,
                user_id: user_id ? parseInt(user_id) : null,
                vehicle_number: vehicle_number || null,
                access_type: access_type || "QR",
                status: status || "Active"
            },
            include: {
                user: { select: { name: true } }
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'CREATED', 'PARKING_SLOT', `Created Slot ${slot_number}`);
        res.status(201).json(newSlot);
    }
    catch (error) {
        if (error.code === 'P2002') {
            // Handle unique constraint violations
            if ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('slot_number')) {
                return res.status(400).json({ error: "Slot number already exists" });
            }
            if ((_d = (_c = error.meta) === null || _c === void 0 ? void 0 : _c.target) === null || _d === void 0 ? void 0 : _d.includes('user_id')) {
                return res.status(400).json({ error: "Employee already has an assigned slot" });
            }
        }
        console.error("Error creating parking slot:", error);
        res.status(500).json({ error: "Failed to create parking slot" });
    }
});
// Update a Parking Slot
router.put('/:id', async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const { slot_number, user_id, vehicle_number, access_type, status } = req.body;
        const updatedSlot = await prismaClient_1.default.parkingSlot.update({
            where: { id: parseInt(id) },
            data: {
                slot_number,
                user_id: user_id ? parseInt(user_id) : null,
                vehicle_number: vehicle_number || null,
                access_type,
                status
            },
            include: {
                user: { select: { name: true } }
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'PARKING_SLOT', `Updated Slot ${slot_number}`);
        res.json(updatedSlot);
    }
    catch (error) {
        if (error.code === 'P2002') {
            if ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('slot_number')) {
                return res.status(400).json({ error: "Slot number already exists" });
            }
            if ((_d = (_c = error.meta) === null || _c === void 0 ? void 0 : _c.target) === null || _d === void 0 ? void 0 : _d.includes('user_id')) {
                return res.status(400).json({ error: "Employee already has an assigned slot" });
            }
        }
        console.error("Error updating parking slot:", error);
        res.status(500).json({ error: "Failed to update parking slot" });
    }
});
// Delete a Parking Slot
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const slot = await prismaClient_1.default.parkingSlot.delete({
            where: { id: parseInt(id) }
        });
        await (0, activityLogger_1.logActivity)(null, 'DELETED', 'PARKING_SLOT', `Deleted Slot #${id}`);
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting parking slot:", error);
        res.status(500).json({ error: "Failed to delete parking slot" });
    }
});
exports.default = router;
//# sourceMappingURL=employee-parking.js.map