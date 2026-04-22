"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
/**
 * GET all holiday groups
 */
router.get('/', async (req, res) => {
    try {
        const groups = await prismaClient_1.default.holidayGroup.findMany({
            include: {
                _count: {
                    select: { holidays: true }
                }
            }
        });
        res.json(groups);
    }
    catch (err) {
        console.error('Fetch Holiday Groups Error:', err);
        res.status(500).json({ error: 'Failed to fetch holiday groups' });
    }
});
/**
 * POST create a new holiday group
 */
router.post('/', async (req, res) => {
    try {
        const { name, description, holidayIds } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Group Name is required' });
        const group = await prismaClient_1.default.holidayGroup.create({
            data: {
                name,
                description,
                holidays: {
                    create: (holidayIds || []).map((id) => ({
                        holiday: { connect: { id } }
                    }))
                }
            }
        });
        res.status(201).json(group);
    }
    catch (err) {
        console.error('Create Holiday Group Error:', err);
        res.status(500).json({ error: 'Failed to create holiday group' });
    }
});
/**
 * DELETE a holiday group
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prismaClient_1.default.holidayGroup.delete({ where: { id } });
        res.json({ message: 'Holiday group deleted successfully' });
    }
    catch (err) {
        console.error('Delete Holiday Group Error:', err);
        res.status(500).json({ error: 'Failed to delete holiday group' });
    }
});
/**
 * GET all group assignments
 */
router.get('/assignments', async (req, res) => {
    try {
        const assignments = await prismaClient_1.default.holidayGroupAssignment.findMany({
            include: {
                group: true,
                user: { select: { id: true, name: true, branch: { select: { name: true } }, department: { select: { name: true } } } },
                department: { select: { id: true, name: true, branch: { select: { name: true } } } }
            }
        });
        res.json(assignments);
    }
    catch (err) {
        console.error('Fetch Assignments Error:', err);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});
/**
 * POST assign group to user or department
 */
router.post('/assign', async (req, res) => {
    try {
        const { groupId, userId, departmentId } = req.body;
        if (!groupId || (!userId && !departmentId)) {
            return res.status(400).json({ error: 'Group ID and either User ID or Department ID are required' });
        }
        const assignment = await prismaClient_1.default.holidayGroupAssignment.create({
            data: {
                groupId: Number(groupId),
                userId: userId ? Number(userId) : null,
                departmentId: departmentId ? Number(departmentId) : null
            }
        });
        res.status(201).json(assignment);
    }
    catch (err) {
        console.error('Assign Holiday Group Error:', err);
        res.status(500).json({ error: 'Failed to assign holiday group' });
    }
});
/**
 * DELETE an assignment
 */
router.delete('/assignments/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prismaClient_1.default.holidayGroupAssignment.delete({ where: { id } });
        res.json({ message: 'Assignment removed successfully' });
    }
    catch (err) {
        console.error('Remove Assignment Error:', err);
        res.status(500).json({ error: 'Failed to remove assignment' });
    }
});
exports.default = router;
//# sourceMappingURL=groups.js.map