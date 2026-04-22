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
// GET all groups (paginated, with search filters)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const limit = 10;
        const where = search ? {
            OR: [
                { name: { contains: search } },
                { type: { contains: search } }
            ]
        } : {};
        const totalItems = yield prismaClient_1.default.chatGroup.count({ where });
        let groups = yield prismaClient_1.default.chatGroup.findMany({
            where,
            include: {
                _count: {
                    select: { members: true }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Quick resolution to find AutoBranch name if any
        // In a strict production system you'd do a Join or map, but since AutoBranchIds aren't joined:
        const groupsWithExtra = yield Promise.all(groups.map((g) => __awaiter(void 0, void 0, void 0, function* () {
            let autoBranchName = null;
            if (g.autoBranchId) {
                const b = yield prismaClient_1.default.branch.findUnique({ where: { id: g.autoBranchId }, select: { name: true } });
                if (b)
                    autoBranchName = b.name;
            }
            return Object.assign(Object.assign({}, g), { autoBranchName });
        })));
        res.json({ groups: groupsWithExtra, totalItems, page });
    }
    catch (error) {
        console.error("Error fetching chat groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
}));
// POST create group (handles auto & manual logic)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, icon, type, visibilityType, isAutoCreated, autoBranchId, autoDepartmentId, autoZoneId, autoLevelId, selectedMemberIds } = req.body;
        const newGroup = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create group
            const group = yield tx.chatGroup.create({
                data: {
                    name,
                    icon,
                    type,
                    visibilityType: visibilityType || 'Public',
                    isAutoCreated: Boolean(isAutoCreated),
                    autoBranchId: autoBranchId ? parseInt(autoBranchId) : null,
                    autoDepartmentId: autoDepartmentId ? parseInt(autoDepartmentId) : null,
                    autoZoneId: autoZoneId ? parseInt(autoZoneId) : null,
                    autoLevelId: autoLevelId ? parseInt(autoLevelId) : null
                }
            });
            // 2. Add members
            let userIdsToAdd = [];
            if (isAutoCreated) {
                const whereClause = {};
                if (autoBranchId)
                    whereClause.branch_id = parseInt(autoBranchId);
                if (autoDepartmentId)
                    whereClause.department_id = parseInt(autoDepartmentId);
                if (autoLevelId)
                    whereClause.employee_level_id = parseInt(autoLevelId);
                if (Object.keys(whereClause).length > 0) {
                    const matchedUsers = yield tx.user.findMany({
                        where: whereClause,
                        select: { id: true }
                    });
                    userIdsToAdd = matchedUsers.map(u => u.id);
                }
            }
            else if (selectedMemberIds && Array.isArray(selectedMemberIds) && selectedMemberIds.length > 0) {
                userIdsToAdd = selectedMemberIds.map(id => parseInt(id));
            }
            if (userIdsToAdd.length > 0) {
                yield tx.chatGroupMember.createMany({
                    data: userIdsToAdd.map(uid => ({
                        groupId: group.id,
                        userId: uid,
                        role: "Member",
                        visibility: true
                    }))
                });
            }
            return group;
        }));
        res.status(201).json(newGroup);
    }
    catch (error) {
        console.error("Error creating chat group:", error);
        res.status(500).json({ error: "Failed to create group" });
    }
}));
// PUT edit group
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { name, icon, status } = req.body;
        const updated = yield prismaClient_1.default.chatGroup.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign({}, (name && { name })), (icon !== undefined && { icon })), (status && { status }))
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating chat group:", error);
        res.status(500).json({ error: "Failed to update group" });
    }
}));
// DELETE delete group
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield prismaClient_1.default.chatGroup.delete({
            where: { id }
        });
        res.json({ message: "Group deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting chat group:", error);
        res.status(500).json({ error: "Failed to delete group" });
    }
}));
exports.default = router;
