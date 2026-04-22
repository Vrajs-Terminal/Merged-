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
// GET comments for a complaint
router.get('/:complaintId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.complaintId);
        const { include_internal } = req.query;
        const where = { complaint_id: id };
        if (include_internal !== 'true')
            where.is_internal = false;
        const comments = yield prismaClient_1.default.complaintComment.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(comments);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST a comment
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { complaint_id, user_id, comment, is_internal } = req.body;
        if (!complaint_id || !user_id || !comment) {
            return res.status(400).json({ message: 'Complaint, User, and Comment are required' });
        }
        const newComment = yield prismaClient_1.default.complaintComment.create({
            data: {
                complaint_id: Number(complaint_id),
                user_id: Number(user_id),
                comment,
                is_internal: Boolean(is_internal)
            },
            include: {
                user: { select: { id: true, name: true, role: true } }
            }
        });
        // Update complaint last_updated_at
        yield prismaClient_1.default.complaint.update({
            where: { id: Number(complaint_id) },
            data: { last_updated_at: new Date() }
        });
        res.status(201).json(newComment);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
