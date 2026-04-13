import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

/* GET ALL QUESTIONS FOR A TEMPLATE */
export const getQuestionsByTemplate = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params;
        const questions = await prisma.templateQuestion.findMany({
            where: { templateId: Number(templateId) },
            orderBy: { id: "asc" }
        });

        res.status(200).json(questions);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* CREATE QUESTION */
export const createQuestion = async (req: Request, res: Response) => {
    try {
        const {
            templateId,
            questionTitle,
            placeholder,
            questionType,
            isRequired,
            options
        } = req.body;

        const question = await prisma.templateQuestion.create({
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
    } catch (error: any) {
        res.status(500).json({ message: "Failed to create question", error: error.message });
    }
};

/* UPDATE QUESTION */
export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            questionTitle,
            placeholder,
            questionType,
            isRequired,
            options
        } = req.body;

        const question = await prisma.templateQuestion.update({
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
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update question", error: error.message });
    }
};

/* DELETE QUESTION */
export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.templateQuestion.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to delete question", error: error.message });
    }
};
