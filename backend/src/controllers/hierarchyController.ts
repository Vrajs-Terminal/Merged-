import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

export const getHierarchy = async (req: Request, res: Response) => {
    try {
        const { rootId } = req.query; // Optional: specify root user

        // Fetch all active employees
        const employees = await prisma.employee.findMany({
            where: { status: 'Active' },
            select: {
                id: true,
                employeeId: true,
                firstName: true,
                lastName: true,
                managerId: true,
                designationRef: { select: { designationName: true } },
                level: { select: { levelName: true } }
            }
        });

        // Map them by ID for quick access
        const empMap = new Map();
        employees.forEach(emp => {
            empMap.set(emp.id, {
                ...emp,
                designationName: emp.designationRef?.designationName || "No Role",
                levelName: emp.level?.levelName || "No Level",
                children: []
            });
        });

        let hierarchy: any[] = [];
        let specificRoot = rootId ? parseInt(rootId as string) : null;

        empMap.forEach(emp => {
            if (emp.managerId) {
                const manager = empMap.get(emp.managerId);
                if (manager) {
                    manager.children.push(emp);
                } else if (!specificRoot) {
                    // Manager deleted or inactive, treat as root
                    hierarchy.push(emp);
                }
            } else if (!specificRoot) {
                // No manager, top level
                hierarchy.push(emp);
            }
        });

        if (specificRoot) {
            const rootNode = empMap.get(specificRoot);
            if (rootNode) hierarchy = [rootNode];
        }

        res.json(hierarchy);
    } catch (error) {
        console.error("Hierarchy error:", error);
        res.status(500).json({ error: "Failed to fetch hierarchy" });
    }
};

export const getLevelHierarchy = async (req: Request, res: Response) => {
    try {
        const levels = await prisma.level.findMany({
            where: { status: 'Active' },
            include: {
                _count: { select: { employees: true } }
            }
        });

        const levelMap = new Map();
        levels.forEach((l: any) => {
            levelMap.set(l.id, {
                ...l,
                employeeCount: l._count.employees,
                children: []
            });
        });

        let hierarchy: any[] = [];
        levelMap.forEach(l => {
            if (l.parentLevelId) {
                const parent = levelMap.get(l.parentLevelId);
                if (parent) {
                    parent.children.push(l);
                } else {
                    hierarchy.push(l);
                }
            } else {
                hierarchy.push(l);
            }
        });

        res.json(hierarchy);
    } catch (error) {
        console.error("Level Hierarchy error:", error);
        res.status(500).json({ error: "Failed to fetch level hierarchy" });
    }
};
