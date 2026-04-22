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
// Get all emergency numbers
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const numbers = yield prismaClient_1.default.emergencyNumber.findMany({
            orderBy: {
                createdAt: 'desc' // Newest first
            }
        });
        res.json(numbers);
    }
    catch (error) {
        console.error("Error fetching emergency numbers:", error);
        res.status(500).json({ error: "Failed to fetch emergency numbers" });
    }
}));
// Create a new emergency number
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contact_name, number, type, status } = req.body;
        if (!contact_name || !number) {
            return res.status(400).json({ error: "Contact name and number are required" });
        }
        const newContact = yield prismaClient_1.default.emergencyNumber.create({
            data: {
                contact_name,
                number,
                type: type || "Medical",
                status: status || "Active"
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'EMERGENCY_NUMBER', contact_name);
        res.status(201).json(newContact);
    }
    catch (error) {
        console.error("Error creating emergency number:", error);
        res.status(500).json({ error: "Failed to create emergency number" });
    }
}));
// Update an emergency number
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { contact_name, number, type, status } = req.body;
        const updatedContact = yield prismaClient_1.default.emergencyNumber.update({
            where: { id: parseInt(id) },
            data: {
                contact_name,
                number,
                type,
                status
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'EMERGENCY_NUMBER', contact_name);
        res.json(updatedContact);
    }
    catch (error) {
        console.error("Error updating emergency number:", error);
        res.status(500).json({ error: "Failed to update emergency number" });
    }
}));
// Delete an emergency number
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const contact = yield prismaClient_1.default.emergencyNumber.findUnique({ where: { id: parseInt(id) } });
        yield prismaClient_1.default.emergencyNumber.delete({
            where: { id: parseInt(id) }
        });
        if (contact) {
            yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'EMERGENCY_NUMBER', contact.contact_name);
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting emergency number:", error);
        res.status(500).json({ error: "Failed to delete emergency number" });
    }
}));
exports.default = router;
