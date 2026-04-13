import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

// GET ALL OFFBOARDING RECORDS
export const getOffboardings = async (req: Request, res: Response) => {
    try {
        const offboardings = await prisma.offboarding.findMany({
            include: {
                employee: true,
                checklists: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(offboardings);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// INITIATE OFFBOARDING
export const initiateOffboarding = async (req: Request, res: Response) => {
    try {
        const { employeeDbId, lastWorkingDate, reason } = req.body;

        if (!employeeDbId) {
            return res.status(400).json({ message: "Employee ID is required" });
        }

        // Check if already offboarding
        const existing = await prisma.offboarding.findFirst({
            where: { employeeId: employeeDbId }
        });

        if (existing) {
            return res.status(400).json({ message: "Employee is already in offboarding process." });
        }

        // Create Offboarding Parent
        const offboarding = await prisma.offboarding.create({
            data: {
                employeeId: employeeDbId,
                lastWorkingDate: lastWorkingDate ? new Date(lastWorkingDate) : null,
                reason,
                status: "Pending"
            }
        });

        // Spawn default checklist items
        const defaultTasks = [
            { department: "HR", taskName: "Final Settlement and Relieving Letter" },
            { department: "IT", taskName: "Laptop & Access Revocation" },
            { department: "Admin", taskName: "ID Card & Asset Return" },
            { department: "Finance", taskName: "Expense and Payroll Clearances" }
        ];

        await prisma.exitChecklist.createMany({
            data: defaultTasks.map(t => ({
                offboardingId: offboarding.id,
                department: t.department,
                taskName: t.taskName,
                status: "Pending"
            }))
        });

        res.status(201).json({ message: "Offboarding Initiated", offboarding });
    } catch (error) {
        console.error("Initiate Offboarding Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// UPDATE CHECKLIST STATUS
export const updateChecklist = async (req: Request, res: Response) => {
    try {
        const { checklistId } = req.params;
        const { status } = req.body; // "Pending" or "Completed"

        const updated = await prisma.exitChecklist.update({
            where: { id: parseInt(checklistId as string) },
            data: {
                status,
                completionDate: status === 'Completed' ? new Date() : null
            }
        });

        // Check if all checklists are completed to auto-complete the offboarding
        const allChecklists = await prisma.exitChecklist.findMany({
            where: { offboardingId: updated.offboardingId }
        });

        if (allChecklists.every((c: any) => c.status === "Completed")) {
            await prisma.offboarding.update({
                where: { id: updated.offboardingId },
                data: { status: "Completed" }
            });
        } else {
            // Keep it pending if one is reversed
            await prisma.offboarding.update({
                where: { id: updated.offboardingId },
                data: { status: "Pending" }
            });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// DELETE OFFBOARDING (Cancel)
export const cancelOffboarding = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete child checklists first
        await prisma.exitChecklist.deleteMany({
            where: { offboardingId: parseInt(id as string) }
        });

        await prisma.offboarding.delete({
            where: { id: parseInt(id as string) }
        });

        res.status(200).json({ message: "Offboarding cancelled successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
