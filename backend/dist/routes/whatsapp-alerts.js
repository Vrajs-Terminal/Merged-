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
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = express_1.default.Router();
// Get all WhatsApp Alerts
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alerts = yield prismaClient_1.default.whatsAppAlert.findMany({
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
}));
// Create a new WhatsApp Alert
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { alert_name, trigger_event, recipient_type, message_template, status } = req.body;
        const newAlert = yield prismaClient_1.default.whatsAppAlert.create({
            data: {
                alert_name,
                trigger_event,
                recipient_type: recipient_type || "Employee",
                message_template,
                status: status || "Active"
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'WHATSAPP_ALERT', alert_name);
        res.status(201).json(newAlert);
    }
    catch (error) {
        console.error("Error creating whatsapp alert:", error);
        res.status(500).json({ error: "Failed to create whatsapp alert" });
    }
}));
// Update a WhatsApp Alert
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { alert_name, trigger_event, recipient_type, message_template, status } = req.body;
        const updatedAlert = yield prismaClient_1.default.whatsAppAlert.update({
            where: { id: parseInt(id) },
            data: {
                alert_name,
                trigger_event,
                recipient_type,
                message_template,
                status
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'WHATSAPP_ALERT', alert_name);
        res.json(updatedAlert);
    }
    catch (error) {
        console.error("Error updating whatsapp alert:", error);
        res.status(500).json({ error: "Failed to update whatsapp alert" });
    }
}));
// Delete a WhatsApp Alert
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const alert = yield prismaClient_1.default.whatsAppAlert.findUnique({ where: { id: parseInt(id) } });
        yield prismaClient_1.default.whatsAppAlert.delete({
            where: { id: parseInt(id) }
        });
        if (alert) {
            yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'WHATSAPP_ALERT', alert.alert_name);
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting whatsapp alert:", error);
        res.status(500).json({ error: "Failed to delete whatsapp alert" });
    }
}));
exports.default = router;
