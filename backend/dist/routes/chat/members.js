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
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// GET all members of a group
router.get('/:groupId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = parseInt(req.params.groupId);
        if (isNaN(groupId))
            return res.status(400).json({ error: "Invalid group ID" });
        const members = yield prismaClient_1.default.chatGroupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                        branch: { select: { name: true } },
                        department: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ members });
    }
    catch (error) {
        console.error("Error fetching chat members:", error);
        res.status(500).json({ error: "Failed to fetch members" });
    }
}));
// POST add a member manually
router.post('/:groupId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = parseInt(req.params.groupId);
        const { userId, role, visibility } = req.body;
        if (isNaN(groupId) || !userId)
            return res.status(400).json({ error: "Invalid input" });
        const member = yield prismaClient_1.default.chatGroupMember.create({
            data: {
                groupId,
                userId: parseInt(userId),
                role: role || "Member",
                visibility: visibility !== undefined ? visibility : true,
                status: "Active"
            }
        });
        // Refetch to get user details
        const fullMember = yield prismaClient_1.default.chatGroupMember.findUnique({
            where: { id: member.id },
            include: {
                user: {
                    select: { name: true, branch: { select: { name: true } }, department: { select: { name: true } } }
                }
            }
        });
        res.status(201).json(fullMember);
    }
    catch (error) {
        console.error("Error adding chat member:", error);
        // Catch unique constraint violations nicely
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return res.status(400).json({ error: "User is already a member of this group" });
        }
        res.status(500).json({ error: "Failed to add member" });
    }
}));
// PUT update role / visibility
router.put('/:groupId/:memberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberId = parseInt(req.params.memberId);
        const { role, visibility, status } = req.body;
        const data = {};
        if (role)
            data.role = role;
        if (visibility !== undefined)
            data.visibility = visibility;
        if (status)
            data.status = status;
        const updated = yield prismaClient_1.default.chatGroupMember.update({
            where: { id: memberId },
            data,
            include: {
                user: {
                    select: { name: true }
                }
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating chat member:", error);
        res.status(500).json({ error: "Failed to update member" });
    }
}));
// DELETE remove member
router.delete('/:groupId/:memberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberId = parseInt(req.params.memberId);
        yield prismaClient_1.default.chatGroupMember.delete({
            where: { id: memberId }
        });
        res.json({ message: "Member removed successfully" });
    }
    catch (error) {
        console.error("Error deleting chat member:", error);
        res.status(500).json({ error: "Failed to delete member" });
    }
}));
exports.default = router;
