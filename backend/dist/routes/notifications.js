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
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Get recent notifications (compact: 5, full: 100)
// Privacy Filter: Only return logs for the authenticated user
router.get('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const limitStr = req.query.limit;
        const limit = limitStr ? parseInt(limitStr) : 50;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'Admin' || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === 'SuperAdmin';
        if (!isAdmin) {
            return res.json([]); // Only admins see activity logs
        }
        const logs = yield prismaClient_1.default.activityLog.findMany({
            where: {}, // Admin sees all activity
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Failed to fetch activity logs:', error === null || error === void 0 ? void 0 : error.message);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
}));
exports.default = router;
