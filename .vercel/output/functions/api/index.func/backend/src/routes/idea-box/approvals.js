"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
/**
 * GET all pending reviews for management
 */
router.get('/pending', async (req, res) => {
    try {
        const ideas = await prismaClient_1.default.idea.findMany({
            where: {
                status: { in: ['Pending', 'Under Review'] }
            },
            include: {
                user: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                _count: { select: { votes: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ideas);
    }
    catch (err) {
        console.error('Fetch Pending Reviews Error:', err);
        res.status(500).json({ error: 'Failed to fetch pending reviews' });
    }
});
/**
 * POST review an idea (Approve, Reject, Under Review)
 * Optional: Assign reward points
 */
router.post('/:id/review', async (req, res) => {
    try {
        const ideaId = Number(req.params.id);
        const { status, remarks, reward_points } = req.body;
        if (!status)
            return res.status(400).json({ error: 'Status is required' });
        const updatedIdea = await prismaClient_1.default.idea.update({
            where: { id: ideaId },
            data: {
                status: String(status),
                approvalRemarks: remarks || null,
                rewardPoints: reward_points ? Number(reward_points) : 0
            }
        });
        // Track Reward (Extra-ordinary Feature)
        if (status === 'Approved' && reward_points > 0) {
            await prismaClient_1.default.ideaReward.create({
                data: {
                    ideaId,
                    userId: updatedIdea.userId,
                    points: Number(reward_points),
                    description: `Reward for approved idea: ${updatedIdea.title}`
                }
            });
        }
        res.json(updatedIdea);
    }
    catch (err) {
        console.error('Review Idea Error:', err);
        res.status(500).json({ error: 'Failed to process review' });
    }
});
/**
 * POST mark idea as implemented
 */
router.post('/:id/implement', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { implementation_date } = req.body;
        const updated = await prismaClient_1.default.idea.update({
            where: { id },
            data: {
                status: 'Implemented',
                implementationDate: implementation_date ? new Date(String(implementation_date)) : new Date()
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Implement Idea Error:', err);
        res.status(500).json({ error: 'Failed to mark as implemented' });
    }
});
exports.default = router;
//# sourceMappingURL=approvals.js.map