"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.votePoll = exports.deletePoll = exports.createPoll = exports.getAllPolls = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
const getAllPolls = async (req, res) => {
    try {
        const polls = await prisma.poll.findMany({
            include: { options: true },
            orderBy: { createdAt: "desc" }
        });
        res.json(polls);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllPolls = getAllPolls;
const createPoll = async (req, res) => {
    try {
        const { question, description, startDate, endDate, targetAudience, isMultipleChoice, isAnonymous, options } = req.body;
        // Auto status based on date
        const start = new Date(startDate);
        const now = new Date();
        let status = "Active";
        if (start > now)
            status = "Upcoming";
        const poll = await prisma.poll.create({
            data: {
                question,
                description,
                startDate: start,
                endDate: endDate ? new Date(endDate) : null,
                targetAudience,
                isMultipleChoice,
                isAnonymous,
                status,
                options: {
                    create: options.map((opt) => ({ optionText: opt }))
                }
            },
            include: { options: true }
        });
        res.status(201).json(poll);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createPoll = createPoll;
const deletePoll = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.poll.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Poll deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deletePoll = deletePoll;
const votePoll = async (req, res) => {
    try {
        const { optionId } = req.body;
        const option = await prisma.pollOption.update({
            where: { id: parseInt(optionId) },
            data: { votes: { increment: 1 } }
        });
        res.json(option);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.votePoll = votePoll;
//# sourceMappingURL=pollController.js.map