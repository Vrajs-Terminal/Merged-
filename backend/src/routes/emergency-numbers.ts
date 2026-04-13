import express from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = express.Router();

// Get all emergency numbers
router.get('/', async (req, res) => {
    try {
        const numbers = await prisma.emergencyNumber.findMany({
            orderBy: {
                createdAt: 'desc' // Newest first
            }
        });
        res.json(numbers);
    } catch (error) {
        console.error("Error fetching emergency numbers:", error);
        res.status(500).json({ error: "Failed to fetch emergency numbers" });
    }
});

// Create a new emergency number
router.post('/', async (req, res) => {
    try {
        const { contact_name, number, type, status } = req.body;

        if (!contact_name || !number) {
            return res.status(400).json({ error: "Contact name and number are required" });
        }

        const newContact = await prisma.emergencyNumber.create({
            data: {
                contact_name,
                number,
                type: type || "Medical",
                status: status || "Active"
            }
        });

        await logActivity(null, 'CREATED', 'EMERGENCY_NUMBER', contact_name);
        res.status(201).json(newContact);
    } catch (error) {
        console.error("Error creating emergency number:", error);
        res.status(500).json({ error: "Failed to create emergency number" });
    }
});

// Update an emergency number
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { contact_name, number, type, status } = req.body;

        const updatedContact = await prisma.emergencyNumber.update({
            where: { id: parseInt(id) },
            data: {
                contact_name,
                number,
                type,
                status
            }
        });

        await logActivity(null, 'UPDATED', 'EMERGENCY_NUMBER', contact_name);
        res.json(updatedContact);
    } catch (error) {
        console.error("Error updating emergency number:", error);
        res.status(500).json({ error: "Failed to update emergency number" });
    }
});

// Delete an emergency number
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await prisma.emergencyNumber.findUnique({ where: { id: parseInt(id) } });
        await prisma.emergencyNumber.delete({
            where: { id: parseInt(id) }
        });
        if (contact) {
            await logActivity(null, 'DELETED', 'EMERGENCY_NUMBER', contact.contact_name);
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting emergency number:", error);
        res.status(500).json({ error: "Failed to delete emergency number" });
    }
});

export default router;
