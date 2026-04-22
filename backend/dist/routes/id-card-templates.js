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
// Get all ID Card Templates
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templates = yield prismaClient_1.default.idCardTemplate.findMany({
            include: {
                branch: true,
                department: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(templates);
    }
    catch (error) {
        console.error("Error fetching ID card templates:", error);
        res.status(500).json({ error: "Failed to fetch ID card templates" });
    }
}));
// Create a new ID Card Template
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { template_name, template_type, branch_id, department_id, status } = req.body;
        const newTemplate = yield prismaClient_1.default.idCardTemplate.create({
            data: {
                template_name,
                template_type: template_type || "Employee",
                branch_id: branch_id ? parseInt(branch_id) : null,
                department_id: department_id ? parseInt(department_id) : null,
                status: status || "Active"
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'ID_CARD_TEMPLATE', template_name);
        res.status(201).json(newTemplate);
    }
    catch (error) {
        console.error("Error creating ID card template:", error);
        res.status(500).json({ error: "Failed to create ID card template" });
    }
}));
// Update an ID Card Template
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { template_name, template_type, branch_id, department_id, status } = req.body;
        const updatedTemplate = yield prismaClient_1.default.idCardTemplate.update({
            where: { id: parseInt(id) },
            data: {
                template_name,
                template_type,
                branch_id: branch_id ? parseInt(branch_id) : null,
                department_id: department_id ? parseInt(department_id) : null,
                status
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'ID_CARD_TEMPLATE', template_name);
        res.json(updatedTemplate);
    }
    catch (error) {
        console.error("Error updating ID card template:", error);
        res.status(500).json({ error: "Failed to update ID card template" });
    }
}));
// Delete an ID Card Template
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const template = yield prismaClient_1.default.idCardTemplate.findUnique({ where: { id: parseInt(id) } });
        yield prismaClient_1.default.idCardTemplate.delete({
            where: { id: parseInt(id) }
        });
        if (template) {
            yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'ID_CARD_TEMPLATE', template.template_name);
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting ID card template:", error);
        res.status(500).json({ error: "Failed to delete ID card template" });
    }
}));
exports.default = router;
