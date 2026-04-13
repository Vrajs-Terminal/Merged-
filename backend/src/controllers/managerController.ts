import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getManagers = async (req: Request, res: Response) => {
    try {
        const managers = await prisma.manager.findMany({
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        });
        res.status(200).json(managers);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const createManager = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const manager = await prisma.manager.create({
            data,
        });
        res.status(201).json(manager);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const updateManager = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const data = req.body;

        const updatedManager = await prisma.manager.update({
            where: { id: parseInt(id) },
            data
        });

        res.status(200).json(updatedManager);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteManager = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const manager = await prisma.manager.findUnique({
            where: { id: parseInt(id) },
            include: { _count: { select: { employees: true } } }
        });

        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        if (manager._count.employees > 0) {
            return res.status(400).json({ message: "Cannot delete manager with active assigned employees. Please reassign them first." });
        }

        await prisma.manager.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({ message: "Manager deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const assignEmployees = async (req: Request, res: Response) => {
    try {
        // expect an array of employee id integers
        const { managerId, employeeIds, effectiveFrom, remarks } = req.body;

        if (!managerId || !employeeIds || !Array.isArray(employeeIds)) {
            return res.status(400).json({ message: "Invalid request format" });
        }

        // Update all chosen employees to point to this manager
        const updateResult = await prisma.employee.updateMany({
            where: {
                id: { in: employeeIds }
            },
            data: {
                managerId: parseInt(managerId),
                managerEffectiveDate: effectiveFrom ? new Date(effectiveFrom) : null,
                managerRemarks: remarks || null
            }
        });

        res.status(200).json({ message: `Successfully assigned ${updateResult.count} employees to manager.`, count: updateResult.count });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
