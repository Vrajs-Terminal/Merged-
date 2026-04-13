import { Router } from 'express';
import prisma from '../../lib/prismaClient';

const router = Router();

// GET all members of a group
router.get('/:groupId', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        if (isNaN(groupId)) return res.status(400).json({ error: "Invalid group ID" });

        const members = await prisma.chatGroupMember.findMany({
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
    } catch (error) {
        console.error("Error fetching chat members:", error);
        res.status(500).json({ error: "Failed to fetch members" });
    }
});

// POST add a member manually
router.post('/:groupId', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { userId, role, visibility } = req.body;

        if (isNaN(groupId) || !userId) return res.status(400).json({ error: "Invalid input" });

        const member = await prisma.chatGroupMember.create({
            data: {
                groupId,
                userId: parseInt(userId),
                role: role || "Member",
                visibility: visibility !== undefined ? visibility : true,
                status: "Active"
            }
        });

        // Refetch to get user details
        const fullMember = await prisma.chatGroupMember.findUnique({
            where: { id: member.id },
            include: {
                user: {
                    select: { name: true, branch: { select: { name: true } }, department: { select: { name: true } } }
                }
            }
        });

        res.status(201).json(fullMember);
    } catch (error) {
        console.error("Error adding chat member:", error);
        // Catch unique constraint violations nicely
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
             return res.status(400).json({ error: "User is already a member of this group" });
        }
        res.status(500).json({ error: "Failed to add member" });
    }
});

// PUT update role / visibility
router.put('/:groupId/:memberId', async (req, res) => {
    try {
        const memberId = parseInt(req.params.memberId);
        const { role, visibility, status } = req.body;

        const data: any = {};
        if (role) data.role = role;
        if (visibility !== undefined) data.visibility = visibility;
        if (status) data.status = status;

        const updated = await prisma.chatGroupMember.update({
            where: { id: memberId },
            data,
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating chat member:", error);
        res.status(500).json({ error: "Failed to update member" });
    }
});

// DELETE remove member
router.delete('/:groupId/:memberId', async (req, res) => {
    try {
        const memberId = parseInt(req.params.memberId);
        await prisma.chatGroupMember.delete({
            where: { id: memberId }
        });
        res.json({ message: "Member removed successfully" });
    } catch (error) {
        console.error("Error deleting chat member:", error);
        res.status(500).json({ error: "Failed to delete member" });
    }
});

export default router;
