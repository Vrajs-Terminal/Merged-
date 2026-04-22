"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
/* GET ALL TEMPLATES */
const getTemplates = async (req, res) => {
    try {
        const templates = await prismaClient_1.default.celebrationTemplate.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(templates);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getTemplates = getTemplates;
/* CREATE TEMPLATE */
const createTemplate = async (req, res) => {
    try {
        const template = await prismaClient_1.default.celebrationTemplate.create({
            data: req.body,
        });
        res.status(201).json({ message: "Template created successfully", template });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create template", error: error.message });
    }
};
exports.createTemplate = createTemplate;
/* UPDATE TEMPLATE */
const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await prismaClient_1.default.celebrationTemplate.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.status(200).json({ message: "Template updated successfully", template });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update template", error: error.message });
    }
};
exports.updateTemplate = updateTemplate;
/* DELETE TEMPLATE */
const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.celebrationTemplate.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: "Template deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete template", error: error.message });
    }
};
exports.deleteTemplate = deleteTemplate;
//# sourceMappingURL=celebrationTemplateController.js.map