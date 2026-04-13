import express from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = express.Router();

// Get all Parking Slots
router.get('/', async (req, res) => {
    try {
        const slots = await prisma.parkingSlot.findMany({
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
    } catch (error) {
        console.error("Error fetching parking slots:", error);
        res.status(500).json({ error: "Failed to fetch parking slots" });
    }
});

// Create a new Parking Slot
router.post('/', async (req, res) => {
    try {
        const { slot_number, user_id, vehicle_number, access_type, status } = req.body;

        if (!slot_number) {
            return res.status(400).json({ error: "Slot number is required" });
        }

        const newSlot = await prisma.parkingSlot.create({
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

        await logActivity(null, 'CREATED', 'PARKING_SLOT', `Created Slot ${slot_number}`);
        res.status(201).json(newSlot);
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Handle unique constraint violations
            if (error.meta?.target?.includes('slot_number')) {
                return res.status(400).json({ error: "Slot number already exists" });
            }
            if (error.meta?.target?.includes('user_id')) {
                return res.status(400).json({ error: "Employee already has an assigned slot" });
            }
        }
        console.error("Error creating parking slot:", error);
        res.status(500).json({ error: "Failed to create parking slot" });
    }
});

// Update a Parking Slot
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { slot_number, user_id, vehicle_number, access_type, status } = req.body;

        const updatedSlot = await prisma.parkingSlot.update({
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

        await logActivity(null, 'UPDATED', 'PARKING_SLOT', `Updated Slot ${slot_number}`);
        res.json(updatedSlot);
    } catch (error: any) {
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('slot_number')) {
                return res.status(400).json({ error: "Slot number already exists" });
            }
            if (error.meta?.target?.includes('user_id')) {
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

        const slot = await prisma.parkingSlot.delete({
            where: { id: parseInt(id) }
        });

        await logActivity(null, 'DELETED', 'PARKING_SLOT', `Deleted Slot #${id}`);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting parking slot:", error);
        res.status(500).json({ error: "Failed to delete parking slot" });
    }
});

export default router;
