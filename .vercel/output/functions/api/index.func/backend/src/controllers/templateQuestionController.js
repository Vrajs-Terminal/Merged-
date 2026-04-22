"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = exports.getQuestionsByTemplate = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
/* GET ALL QUESTIONS FOR A TEMPLATE */
const getQuestionsByTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const questions = await prismaClient_1.default.templateQuestion.findMany({
            where: { templateId: Number(templateId) },
            orderBy: { id: "asc" }
        });
        res.status(200).json(questions);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getQuestionsByTemplate = getQuestionsByTemplate;
/* CREATE QUESTION */
const createQuestion = async (req, res) => {
    try {
        const { templateId, questionTitle, placeholder, questionType, isRequired, options } = req.body;
        const question = await prismaClient_1.default.templateQuestion.create({
            data: {
                templateId: Number(templateId),
                questionTitle,
                placeholder,
                questionType,
                isRequired: isRequired || "No",
                options: options || null
            },
        });
        res.status(201).json({ message: "Question added successfully", question });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create question", error: error.message });
    }
};
exports.createQuestion = createQuestion;
/* UPDATE QUESTION */
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionTitle, placeholder, questionType, isRequired, options } = req.body;
        const question = await prismaClient_1.default.templateQuestion.update({
            where: { id: Number(id) },
            data: {
                questionTitle,
                placeholder,
                questionType,
                isRequired: isRequired || "No",
                options: options || null
            },
        });
        res.status(200).json({ message: "Question updated successfully", question });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update question", error: error.message });
    }
};
exports.updateQuestion = updateQuestion;
/* DELETE QUESTION */
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.templateQuestion.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: "Question deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete question", error: error.message });
    }
};
exports.deleteQuestion = deleteQuestion;
//# sourceMappingURL=templateQuestionController.js.map