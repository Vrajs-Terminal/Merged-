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
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.surveyController = {
    // Get all surveys
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { status, search } = req.query;
            const where = {};
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { title: { contains: search } },
                    { description: { contains: search } },
                ];
            }
            const surveys = yield prisma.survey.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            questions: true,
                            responses: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(surveys);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    // Get single survey
    getById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const survey = yield prisma.survey.findUnique({
                where: { id: parseInt(id) },
                include: {
                    questions: {
                        orderBy: { order: 'asc' }
                    },
                    _count: {
                        select: { responses: true }
                    }
                }
            });
            if (!survey)
                return res.status(404).json({ message: 'Survey not found' });
            res.json(survey);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    // Create survey
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { title, description, startDate, endDate, targetAudience, isAnonymous, sendReminder, autoClose, questions } = req.body;
            const survey = yield prisma.survey.create({
                data: {
                    title,
                    description,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    targetAudience,
                    isAnonymous,
                    sendReminder,
                    autoClose,
                    status: 'Active',
                    questions: {
                        create: questions === null || questions === void 0 ? void 0 : questions.map((q, index) => ({
                            questionText: q.questionText,
                            questionType: q.questionType,
                            options: q.options,
                            isRequired: q.isRequired,
                            order: q.order || index
                        }))
                    }
                },
                include: {
                    questions: true
                }
            });
            res.status(201).json(survey);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    // Update survey
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { title, description, startDate, endDate, targetAudience, isAnonymous, sendReminder, autoClose, status } = req.body;
            const survey = yield prisma.survey.update({
                where: { id: parseInt(id) },
                data: {
                    title,
                    description,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    targetAudience,
                    isAnonymous,
                    sendReminder,
                    autoClose,
                    status
                }
            });
            res.json(survey);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    // Delete survey
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield prisma.survey.delete({
                where: { id: parseInt(id) }
            });
            res.json({ message: 'Survey deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    // Submit response
    submitResponse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { surveyId, employeeId, answers } = req.body;
            const response = yield prisma.surveyResponse.create({
                data: {
                    surveyId: parseInt(surveyId),
                    employeeId: employeeId ? parseInt(employeeId) : null,
                    answers: {
                        create: answers.map((a) => ({
                            questionId: parseInt(a.questionId),
                            answerText: a.answerText,
                            rating: a.rating
                        }))
                    }
                }
            });
            res.status(201).json(response);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
};
