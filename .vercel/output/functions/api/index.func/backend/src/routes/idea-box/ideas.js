"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
/**
 * GET list of ideas (with filters)
 */
router.get('/', async (req, res) => {
    try {
        const { employee_id, category_id, status, date_from, date_to } = req.query;
        const where = {};
        if (employee_id)
            where.userId = Number(employee_id);
        if (category_id)
            where.categoryId = Number(category_id);
        if (status)
            where.status = String(status);
        if (date_from || date_to) {
            where.createdAt = {};
            if (date_from)
                where.createdAt.gte = new Date(String(date_from));
            if (date_to)
                where.createdAt.lte = new Date(String(date_to));
        }
        const ideas = await prismaClient_1.default.idea.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, branch_id: true, department_id: true } },
                category: { select: { id: true, name: true } },
                _count: { select: { votes: true, comments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ideas);
    }
    catch (err) {
        console.error('Fetch Ideas Error:', err);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});
/**
 * GET single idea details
 */
router.get('/:id', async (req, res) => {
    try {
        const idea = await prismaClient_1.default.idea.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                comments: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'asc' }
                },
                votes: { select: { userId: true } }, // To check if current user voted
                rewards: { select: { points: true, description: true, createdAt: true } }
            }
        });
        if (!idea)
            return res.status(404).json({ error: 'Idea not found' });
        res.json(idea);
    }
    catch (err) {
        console.error('Fetch Idea Details Error:', err);
        res.status(500).json({ error: 'Failed to fetch idea details' });
    }
});
/**
 * POST submit a new idea
 */
router.post('/', async (req, res) => {
    try {
        const { title, category_id, user_id, description, expected_benefit, is_anonymous } = req.body;
        if (!(title === null || title === void 0 ? void 0 : title.trim()) || !category_id || !user_id || !(description === null || description === void 0 ? void 0 : description.trim())) {
            return res.status(400).json({ error: 'Please fill all required fields' });
        }
        const idea = await prismaClient_1.default.idea.create({
            data: {
                title: title.trim(),
                categoryId: Number(category_id),
                userId: Number(user_id),
                description: description.trim(),
                expectedBenefit: expected_benefit || null,
                isAnonymous: Boolean(is_anonymous),
                status: 'Pending'
            }
        });
        res.status(201).json(idea);
    }
    catch (err) {
        console.error('Submit Idea Error:', err);
        res.status(500).json({ error: 'Failed to submit idea' });
    }
});
/**
 * POST toggle vote on an idea
 */
router.post('/:id/vote', async (req, res) => {
    try {
        const ideaId = Number(req.params.id);
        const { user_id } = req.body;
        if (!user_id)
            return res.status(400).json({ error: 'User ID is required' });
        // Check if already voted
        const existingVote = await prismaClient_1.default.ideaVote.findUnique({
            where: {
                ideaId_userId: { ideaId, userId: Number(user_id) }
            }
        });
        if (existingVote) {
            await prismaClient_1.default.ideaVote.delete({ where: { id: existingVote.id } });
            return res.json({ voted: false, message: 'Vote removed' });
        }
        else {
            await prismaClient_1.default.ideaVote.create({
                data: { ideaId, userId: Number(user_id) }
            });
            return res.json({ voted: true, message: 'Voted successfully' });
        }
    }
    catch (err) {
        console.error('Vote Idea Error:', err);
        res.status(500).json({ error: 'Failed to process vote' });
    }
});
/**
 * POST add a comment to an idea
 */
router.post('/:id/comment', async (req, res) => {
    try {
        const ideaId = Number(req.params.id);
        const { user_id, content } = req.body;
        if (!user_id || !(content === null || content === void 0 ? void 0 : content.trim())) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        const comment = await prismaClient_1.default.ideaComment.create({
            data: {
                ideaId,
                userId: Number(user_id),
                content: content.trim()
            },
            include: { user: { select: { id: true, name: true } } }
        });
        res.status(201).json(comment);
    }
    catch (err) {
        console.error('Add Comment Error:', err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});
/**
 * DELETE an idea
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        // Only allow deleting if status is 'Pending'? (Optional rule)
        const idea = await prismaClient_1.default.idea.findUnique({ where: { id } });
        if (!idea)
            return res.status(404).json({ error: 'Idea not found' });
        await prismaClient_1.default.idea.delete({ where: { id } });
        res.json({ message: 'Idea deleted successfully' });
    }
    catch (err) {
        console.error('Delete Idea Error:', err);
        res.status(500).json({ error: 'Failed to delete idea' });
    }
});
exports.default = router;
//# sourceMappingURL=ideas.js.map