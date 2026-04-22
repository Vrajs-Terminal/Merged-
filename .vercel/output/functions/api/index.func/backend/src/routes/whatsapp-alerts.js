"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = express_1.default.Router();
// Get all WhatsApp Alerts
router.get('/', async (req, res) => {
    try {
        const alerts = await prismaClient_1.default.whatsAppAlert.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(alerts);
    }
    catch (error) {
        console.error("Error fetching whatsapp alerts:", error);
        res.status(500).json({ error: "Failed to fetch whatsapp alerts" });
    }
});
// Create a new WhatsApp Alert
router.post('/', async (req, res) => {
    try {
        const { alert_name, trigger_event, recipient_type, message_template, status } = req.body;
        const newAlert = await prismaClient_1.default.whatsAppAlert.create({
            data: {
                alert_name,
                trigger_event,
                recipient_type: recipient_type || "Employee",
                message_template,
                status: status || "Active"
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'CREATED', 'WHATSAPP_ALERT', alert_name);
        res.status(201).json(newAlert);
    }
    catch (error) {
        console.error("Error creating whatsapp alert:", error);
        res.status(500).json({ error: "Failed to create whatsapp alert" });
    }
});
// Update a WhatsApp Alert
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { alert_name, trigger_event, recipient_type, message_template, status } = req.body;
        const updatedAlert = await prismaClient_1.default.whatsAppAlert.update({
            where: { id: parseInt(id) },
            data: {
                alert_name,
                trigger_event,
                recipient_type,
                message_template,
                status
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'WHATSAPP_ALERT', alert_name);
        res.json(updatedAlert);
    }
    catch (error) {
        console.error("Error updating whatsapp alert:", error);
        res.status(500).json({ error: "Failed to update whatsapp alert" });
    }
});
// Delete a WhatsApp Alert
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await prismaClient_1.default.whatsAppAlert.findUnique({ where: { id: parseInt(id) } });
        await prismaClient_1.default.whatsAppAlert.delete({
            where: { id: parseInt(id) }
        });
        if (alert) {
            await (0, activityLogger_1.logActivity)(null, 'DELETED', 'WHATSAPP_ALERT', alert.alert_name);
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting whatsapp alert:", error);
        res.status(500).json({ error: "Failed to delete whatsapp alert" });
    }
});
exports.default = router;
//# sourceMappingURL=whatsapp-alerts.js.map