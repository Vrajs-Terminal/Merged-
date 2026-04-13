import { Router } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// GET all groups (paginated, with search filters)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || '';
        const limit = 10;
        
        const where: any = search ? {
            OR: [
                { name: { contains: search } },
                { type: { contains: search } }
            ]
        } : {};

        const totalItems = await prisma.chatGroup.count({ where });
        let groups = await prisma.chatGroup.findMany({
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
        const groupsWithExtra = await Promise.all(groups.map(async (g) => {
            let autoBranchName = null;
            if (g.autoBranchId) {
                const b = await prisma.branch.findUnique({ where: { id: g.autoBranchId }, select: { name: true }});
                if (b) autoBranchName = b.name;
            }
            return {
                ...g,
                autoBranchName
            };
        }));

        res.json({ groups: groupsWithExtra, totalItems, page });
    } catch (error) {
        console.error("Error fetching chat groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
});

// POST create group (handles auto & manual logic)
router.post('/', async (req, res) => {
    try {
        const { 
            name, icon, type, visibilityType, 
            isAutoCreated, autoBranchId, autoDepartmentId, autoZoneId, autoLevelId,
            selectedMemberIds 
        } = req.body;

        const newGroup = await prisma.$transaction(async (tx) => {
            // 1. Create group
            const group = await tx.chatGroup.create({
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
            let userIdsToAdd: number[] = [];

            if (isAutoCreated) {
                const whereClause: any = {};
                if (autoBranchId) whereClause.branch_id = parseInt(autoBranchId);
                if (autoDepartmentId) whereClause.department_id = parseInt(autoDepartmentId);
                if (autoLevelId) whereClause.employee_level_id = parseInt(autoLevelId);
                
                if (Object.keys(whereClause).length > 0) {
                    const matchedUsers = await tx.user.findMany({
                        where: whereClause,
                        select: { id: true }
                    });
                    userIdsToAdd = matchedUsers.map(u => u.id);
                }
            } else if (selectedMemberIds && Array.isArray(selectedMemberIds) && selectedMemberIds.length > 0) {
                userIdsToAdd = selectedMemberIds.map(id => parseInt(id));
            }

            if (userIdsToAdd.length > 0) {
                await tx.chatGroupMember.createMany({
                    data: userIdsToAdd.map(uid => ({
                        groupId: group.id,
                        userId: uid,
                        role: "Member",
                        visibility: true
                    }))
                });
            }

            return group;
        });

        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Error creating chat group:", error);
        res.status(500).json({ error: "Failed to create group" });
    }
});

// PUT edit group
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, icon, status } = req.body;

        const updated = await prisma.chatGroup.update({
            where: { id },
            data: { 
                ...(name && { name }), 
                ...(icon !== undefined && { icon }), 
                ...(status && { status }) 
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating chat group:", error);
        res.status(500).json({ error: "Failed to update group" });
    }
});

// DELETE delete group
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.chatGroup.delete({
            where: { id }
        });
        res.json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting chat group:", error);
        res.status(500).json({ error: "Failed to delete group" });
    }
});

export default router;
