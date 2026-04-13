import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

// Get all levels in generic format
export const getLevels = async (req: Request, res: Response) => {
    try {
        const levels = await prisma.level.findMany({
            include: {
                parentLevel: true,
                _count: {
                    select: { employees: true }
                }
            },
            orderBy: { hierarchyOrder: 'asc' }
        });
        res.json(levels);
    } catch (error) {
        console.error("Error fetching levels:", error);
        res.status(500).json({ error: "Failed to fetch levels" });
    }
};

// Create a new level
export const createLevel = async (req: Request, res: Response) => {
    try {
        const { levelName, levelCode, description, parentLevelId, hierarchyOrder, status } = req.body;

        // Check if level naturally exists
        const existing = await prisma.level.findUnique({
            where: { levelName }
        });

        if (existing) {
            return res.status(400).json({ error: "Level name already exists" });
        }

        const level = await prisma.level.create({
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
    } catch (error) {
        console.error("Error creating level:", error);
        res.status(500).json({ error: "Failed to create level" });
    }
};

// Update a level
export const updateLevel = async (req: Request, res: Response) => {
    const { id } = req.params;
    const levelId = Number(id as string);
    try {
        const { levelName, levelCode, description, parentLevelId, hierarchyOrder, status } = req.body;

        // Check if parentLevelId is creating a circular reference
        if (parentLevelId && Number(parentLevelId) === levelId) {
            return res.status(400).json({ error: "A level cannot be its own parent" });
        }

        const level = await prisma.level.update({
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
    } catch (error) {
        console.error("Error updating level:", error);
        res.status(500).json({ error: "Failed to update level" });
    }
};

// Delete a level
export const deleteLevel = async (req: Request, res: Response) => {
    const { id } = req.params;
    const levelId = Number(id as string);
    try {
        // Check if any employees are assigned to this level
        const assignedEmployees = await prisma.employee.findFirst({
            where: { levelId: levelId }
        });

        if (assignedEmployees) {
            return res.status(400).json({ error: "Cannot delete level with assigned employees" });
        }

        // Check if any sub-levels exist
        const subLevels = await prisma.level.findFirst({
            where: { parentLevelId: Number(id) }
        });

        if (subLevels) {
            return res.status(400).json({ error: "Cannot delete level with existing sub-levels. Reassign them first." });
        }

        await prisma.level.delete({
            where: { id: levelId }
        });

        res.json({ message: "Level deleted successfully" });
    } catch (error) {
        console.error("Error deleting level:", error);
        res.status(500).json({ error: "Failed to delete level" });
    }
};

// Assign/Update level to employee
export const assignLevel = async (req: Request, res: Response) => {
    try {
        const { employeeId, levelId, effectiveFrom, remarks } = req.body;

        if (!employeeId || !levelId || !effectiveFrom) {
            return res.status(400).json({ error: "Missing required fields: employeeId, levelId, effectiveFrom" });
        }

        const employee = await prisma.employee.findUnique({
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
        const result = await prisma.$transaction(async (prisma) => {

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
    } catch (error) {
        console.error("Error assigning level:", error);
        res.status(500).json({ error: "Failed to assign level" });
    }
};

// Fetch Employee Level History
export const getEmployeeLevelHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const history = await prisma.levelHistory.findMany({
            where: { employeeId: Number(id as string) },
            include: {
                level: true
            },
            orderBy: { effectiveFrom: 'desc' }
        });
        res.json(history);
    } catch (error) {
        console.error("Error fetching level history:", error);
        res.status(500).json({ error: "Failed to fetch level history" });
    }
};

// Fetch Hierarchy Chart Data
export const getLevelHierarchy = async (req: Request, res: Response) => {
    try {
        // Get all levels with their employees count
        const levels = await prisma.level.findMany({
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
        const buildTree = (parentId: number | null): any[] => {
            return levels
                .filter(l => l.parentLevelId === parentId)
                .map(l => ({
                    ...l,
                    children: buildTree(l.id)
                }));
        };

        const tree = buildTree(null);
        res.json({ flat: levels, tree });

    } catch (error) {
        console.error("Error fetching level hierarchy:", error);
        res.status(500).json({ error: "Failed to fetch hierarchy" });
    }
};
