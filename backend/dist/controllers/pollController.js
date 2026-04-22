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
exports.votePoll = exports.deletePoll = exports.createPoll = exports.getAllPolls = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
const getAllPolls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const polls = yield prisma.poll.findMany({
            include: { options: true },
            orderBy: { createdAt: "desc" }
        });
        res.json(polls);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllPolls = getAllPolls;
const createPoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, description, startDate, endDate, targetAudience, isMultipleChoice, isAnonymous, options } = req.body;
        // Auto status based on date
        const start = new Date(startDate);
        const now = new Date();
        let status = "Active";
        if (start > now)
            status = "Upcoming";
        const poll = yield prisma.poll.create({
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
});
exports.createPoll = createPoll;
const deletePoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.poll.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Poll deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deletePoll = deletePoll;
const votePoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { optionId } = req.body;
        const option = yield prisma.pollOption.update({
            where: { id: parseInt(optionId) },
            data: { votes: { increment: 1 } }
        });
        res.json(option);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.votePoll = votePoll;
