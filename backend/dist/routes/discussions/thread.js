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
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET Threaded Comments for a Discussion
router.get('/:id/comments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const comments = yield prismaClient_1.default.discussionComment.findMany({
            where: { discussion_id: Number(id) },
            include: {
                user: { select: { id: true, name: true, role: true } },
                reactions: {
                    select: { user_id: true, reaction: true }
                },
                replies: {
                    include: {
                        user: { select: { id: true, name: true, role: true } },
                        reactions: { select: { user_id: true, reaction: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        // Hierarchy logic: Top-level comments only (replies are nested)
        const topLevel = comments.filter(c => !c.parent_id);
        res.json(topLevel);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST Add Comment / Reply
router.post('/:id/comments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { user_id, comment, parent_id, attachments } = req.body;
        if (!user_id || !comment) {
            return res.status(400).json({ message: 'User ID and Comment text are required' });
        }
        const newComment = yield prismaClient_1.default.discussionComment.create({
            data: {
                discussion_id: Number(id),
                user_id: Number(user_id),
                comment,
                parent_id: parent_id ? Number(parent_id) : null,
                attachments: {
                    create: (attachments || []).map((a) => ({
                        file_url: a.url,
                        file_name: a.name,
                        file_type: a.type
                    }))
                }
            },
            include: {
                user: { select: { id: true, name: true, role: true } },
                attachments: true
            }
        });
        res.status(201).json(newComment);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST React (Toggle Like/Emoji)
router.post('/comments/:id/react', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Comment ID
        const { user_id, reaction } = req.body;
        if (!user_id || !reaction) {
            return res.status(400).json({ message: 'User ID and Reaction are required' });
        }
        const uId = Number(user_id);
        const cId = Number(id);
        // Check if reaction already exists
        const existing = yield prismaClient_1.default.discussionReaction.findFirst({
            where: { comment_id: cId, user_id: uId, reaction }
        });
        if (existing) {
            // Un-react (Delete)
            yield prismaClient_1.default.discussionReaction.delete({ where: { id: existing.id } });
            return res.json({ message: 'Reaction removed', active: false });
        }
        else {
            // Add reaction
            yield prismaClient_1.default.discussionReaction.create({
                data: { comment_id: cId, user_id: uId, reaction }
            });
            return res.status(201).json({ message: 'Reaction added', active: true });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
