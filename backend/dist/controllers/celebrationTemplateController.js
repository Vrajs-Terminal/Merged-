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
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
/* GET ALL TEMPLATES */
const getTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templates = yield prismaClient_1.default.celebrationTemplate.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(templates);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getTemplates = getTemplates;
/* CREATE TEMPLATE */
const createTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const template = yield prismaClient_1.default.celebrationTemplate.create({
            data: req.body,
        });
        res.status(201).json({ message: "Template created successfully", template });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create template", error: error.message });
    }
});
exports.createTemplate = createTemplate;
/* UPDATE TEMPLATE */
const updateTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const template = yield prismaClient_1.default.celebrationTemplate.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.status(200).json({ message: "Template updated successfully", template });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update template", error: error.message });
    }
});
exports.updateTemplate = updateTemplate;
/* DELETE TEMPLATE */
const deleteTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.celebrationTemplate.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: "Template deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete template", error: error.message });
    }
});
exports.deleteTemplate = deleteTemplate;
