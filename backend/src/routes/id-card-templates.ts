import express from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = express.Router();

// Get all ID Card Templates
router.get('/', async (req, res) => {
    try {
        const templates = await prisma.idCardTemplate.findMany({
            include: {
                branch: true,
                department: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(templates);
    } catch (error) {
        console.error("Error fetching ID card templates:", error);
        res.status(500).json({ error: "Failed to fetch ID card templates" });
    }
});

// Create a new ID Card Template
router.post('/', async (req, res) => {
    try {
        const { template_name, template_type, branch_id, department_id, status } = req.body;

        const newTemplate = await prisma.idCardTemplate.create({
            data: {
                template_name,
                template_type: template_type || "Employee",
                branch_id: branch_id ? parseInt(branch_id) : null,
                department_id: department_id ? parseInt(department_id) : null,
                status: status || "Active"
            }
        });

        await logActivity(null, 'CREATED', 'ID_CARD_TEMPLATE', template_name);
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error("Error creating ID card template:", error);
        res.status(500).json({ error: "Failed to create ID card template" });
    }
});

// Update an ID Card Template
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { template_name, template_type, branch_id, department_id, status } = req.body;

        const updatedTemplate = await prisma.idCardTemplate.update({
            where: { id: parseInt(id) },
            data: {
                template_name,
                template_type,
                branch_id: branch_id ? parseInt(branch_id) : null,
                department_id: department_id ? parseInt(department_id) : null,
                status
            }
        });

        await logActivity(null, 'UPDATED', 'ID_CARD_TEMPLATE', template_name);
        res.json(updatedTemplate);
    } catch (error) {
        console.error("Error updating ID card template:", error);
        res.status(500).json({ error: "Failed to update ID card template" });
    }
});

// Delete an ID Card Template
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const template = await prisma.idCardTemplate.findUnique({ where: { id: parseInt(id) } });
        await prisma.idCardTemplate.delete({
            where: { id: parseInt(id) }
        });
        if (template) {
            await logActivity(null, 'DELETED', 'ID_CARD_TEMPLATE', template.template_name);
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting ID card template:", error);
        res.status(500).json({ error: "Failed to delete ID card template" });
    }
});

export default router;
