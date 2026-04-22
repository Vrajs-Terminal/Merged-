"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevelHierarchy = exports.getEmployeeLevelHistory = exports.assignLevel = exports.deleteLevel = exports.updateLevel = exports.createLevel = exports.getLevels = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get all levels in generic format
const getLevels = async (req, res) => {
    try {
        const levels = await prismaClient_1.default.level.findMany({
            include: {
                parentLevel: true,
                _count: {
                    select: { employees: true }
                }
            },
            orderBy: { hierarchyOrder: 'asc' }
        });
        res.json(levels);
    }
    catch (error) {
        console.error("Error fetching levels:", error);
        res.status(500).json({ error: "Failed to fetch levels" });
    }
};
exports.getLevels = getLevels;
// Create a new level
const createLevel = async (req, res) => {
    try {
        const { levelName, levelCode, description, parentLevelId, hierarchyOrder, status } = req.body;
        // Check if level naturally exists
        const existing = await prismaClient_1.default.level.findUnique({
            where: { levelName }
        });
        if (existing) {
            return res.status(400).json({ error: "Level name already exists" });
        }
        const level = await prismaClient_1.default.level.create({
            data: {
                levelName,
                levelCode,
                description,
                parentLevelId: parentLevelId ? Number(parentLevelId) : null,
                hierarchyOrder: hierarchyOrder ? Number(hierarchyOrder) : null,
                status: status || "Active"
            }
        });
        res.status(201).json(level);
    }
    catch (error) {
        console.error("Error creating level:", error);
        res.status(500).json({ error: "Failed to create level" });
    }
};
exports.createLevel = createLevel;
// Update a level
const updateLevel = async (req, res) => {
    const { id } = req.params;
    const levelId = Number(id);
    try {
        const { levelName, levelCode, description, parentLevelId, hierarchyOrder, status } = req.body;
        // Check if parentLevelId is creating a circular reference
        if (parentLevelId && Number(parentLevelId) === levelId) {
            return res.status(400).json({ error: "A level cannot be its own parent" });
        }
        const level = await prismaClient_1.default.level.update({
            where: { id: levelId },
            data: {
                levelName,
                levelCode,
                description,
                parentLevelId: parentLevelId ? Number(parentLevelId) : null,
                hierarchyOrder: hierarchyOrder ? Number(hierarchyOrder) : null,
                status
            }
        });
        res.json(level);
    }
    catch (error) {
        console.error("Error updating level:", error);
        res.status(500).json({ error: "Failed to update level" });
    }
};
exports.updateLevel = updateLevel;
// Delete a level
const deleteLevel = async (req, res) => {
    const { id } = req.params;
    const levelId = Number(id);
    try {
        // Check if any employees are assigned to this level
        const assignedEmployees = await prismaClient_1.default.employee.findFirst({
            where: { levelId: levelId }
        });
        if (assignedEmployees) {
            return res.status(400).json({ error: "Cannot delete level with assigned employees" });
        }
        // Check if any sub-levels exist
        const subLevels = await prismaClient_1.default.level.findFirst({
            where: { parentLevelId: Number(id) }
        });
        if (subLevels) {
            return res.status(400).json({ error: "Cannot delete level with existing sub-levels. Reassign them first." });
        }
        await prismaClient_1.default.level.delete({
            where: { id: levelId }
        });
        res.json({ message: "Level deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting level:", error);
        res.status(500).json({ error: "Failed to delete level" });
    }
};
exports.deleteLevel = deleteLevel;
// Assign/Update level to employee
const assignLevel = async (req, res) => {
    try {
        const { employeeId, levelId, effectiveFrom, remarks } = req.body;
        if (!employeeId || !levelId || !effectiveFrom) {
            return res.status(400).json({ error: "Missing required fields: employeeId, levelId, effectiveFrom" });
        }
        const employee = await prismaClient_1.default.employee.findUnique({
            where: { id: Number(employeeId) }
        });
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }
        if (employee.levelId === Number(levelId)) {
            return res.status(400).json({ error: "Employee is already in this level" });
        }
        // Process Update
        // 1. Transaction to update old LevelHistory effectiveTo if exists, Create new LevelHistory, Update Employee levelId
        const result = await prismaClient_1.default.$transaction(async (prisma) => {
            // End previous active level
            const activeHistory = await prisma.levelHistory.findFirst({
                where: {
                    employeeId: Number(employeeId),
                    effectiveTo: null
                },
                orderBy: {
                    effectiveFrom: 'desc'
                }
            });
            if (activeHistory) {
                await prisma.levelHistory.update({
                    where: { id: activeHistory.id },
                    data: { effectiveTo: new Date(effectiveFrom) }
                });
            }
            // Create new Level History record
            const newHistory = await prisma.levelHistory.create({
                data: {
                    employeeId: Number(employeeId),
                    levelId: Number(levelId),
                    effectiveFrom: new Date(effectiveFrom),
                    remarks: remarks || null
                }
            });
            // Update Employee record
            const updatedEmployee = await prisma.employee.update({
                where: { id: Number(employeeId) },
                data: {
                    levelId: Number(levelId)
                },
                include: {
                    level: true
                }
            });
            return { newHistory, updatedEmployee };
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error assigning level:", error);
        res.status(500).json({ error: "Failed to assign level" });
    }
};
exports.assignLevel = assignLevel;
// Fetch Employee Level History
const getEmployeeLevelHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const history = await prismaClient_1.default.levelHistory.findMany({
            where: { employeeId: Number(id) },
            include: {
                level: true
            },
            orderBy: { effectiveFrom: 'desc' }
        });
        res.json(history);
    }
    catch (error) {
        console.error("Error fetching level history:", error);
        res.status(500).json({ error: "Failed to fetch level history" });
    }
};
exports.getEmployeeLevelHistory = getEmployeeLevelHistory;
// Fetch Hierarchy Chart Data
const getLevelHierarchy = async (req, res) => {
    try {
        // Get all levels with their employees count
        const levels = await prismaClient_1.default.level.findMany({
            include: {
                _count: {
                    select: { employees: { where: { status: "Active" } } }
                },
                employees: {
                    where: { status: "Active" },
                    select: { id: true, firstName: true, lastName: true, employeeId: true, designation: true, _count: true }
                }
            }
        });
        // Build the tree
        const rootLevels = levels.filter(l => !l.parentLevelId);
        // We can just return flat array, but frontend usually needs tree for simple rendering.
        // Let's build tree:
        const buildTree = (parentId) => {
            return levels
                .filter(l => l.parentLevelId === parentId)
                .map(l => ({
                ...l,
                children: buildTree(l.id)
            }));
        };
        const tree = buildTree(null);
        res.json({ flat: levels, tree });
    }
    catch (error) {
        console.error("Error fetching level hierarchy:", error);
        res.status(500).json({ error: "Failed to fetch hierarchy" });
    }
};
exports.getLevelHierarchy = getLevelHierarchy;
//# sourceMappingURL=levelController.js.map