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
/**
 * GET Idea Leaderboard
 * Ranks users based on total reward points and approved ideas.
 */
router.get('/leaderboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topContributors = yield prismaClient_1.default.user.findMany({
            where: {
                ideasSubmitted: { some: { status: 'Approved' } }
            },
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        ideasSubmitted: { where: { status: 'Approved' } }
                    }
                },
                ideaRewardsReceived: {
                    select: { points: true }
                }
            },
            orderBy: {
                ideasSubmitted: { _count: 'desc' }
            },
            take: 10
        });
        // Compute total points per user
        const leaderboard = topContributors.map(u => ({
            id: u.id,
            name: u.name,
            approvedIdeas: u._count.ideasSubmitted,
            totalPoints: u.ideaRewardsReceived.reduce((sum, r) => sum + r.points, 0)
        })).sort((a, b) => b.totalPoints - a.totalPoints || b.approvedIdeas - a.approvedIdeas);
        res.json(leaderboard);
    }
    catch (err) {
        console.error('Fetch Leaderboard Error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
}));
/**
 * GET General Idea Stats
 */
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalIdeas = yield prismaClient_1.default.idea.count();
        const approvedIdeas = yield prismaClient_1.default.idea.count({ where: { status: 'Approved' } });
        const pendingIdeas = yield prismaClient_1.default.idea.count({ where: { status: 'Pending' } });
        const implementedIdeas = yield prismaClient_1.default.idea.count({ where: { status: 'Implemented' } });
        res.json({
            total: totalIdeas,
            approved: approvedIdeas,
            pending: pendingIdeas,
            implemented: implementedIdeas,
            approvalRate: totalIdeas > 0 ? (approvedIdeas / totalIdeas) * 100 : 0
        });
    }
    catch (err) {
        console.error('Fetch Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}));
exports.default = router;
