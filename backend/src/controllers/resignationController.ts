import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getResignations = async (req: Request, res: Response) => {
    try {
        const items = await prisma.resignation.findMany({
            include: { employee: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch resignations" });
    }
};

export const submitResignation = async (req: Request, res: Response) => {
    try {
        const { employeeId, reason, noticePeriodDays } = req.body;

        const np = noticePeriodDays ? parseInt(noticePeriodDays) : 30;

        // Calculate estimated last working date
        const lwd = new Date();
        lwd.setDate(lwd.getDate() + np);

        const resignation = await prisma.resignation.create({
            data: {
                employeeId: parseInt(employeeId),
                reason,
                noticePeriod: np,
                lastWorkingDate: lwd,
                status: "Pending"
            }
        });

        res.status(201).json(resignation);
    } catch (error) {
        res.status(500).json({ error: "Failed to submit resignation" });
    }
};

export const approveResignation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const resignationId = parseInt(id as string, 10);
        const { remarks, finalLastWorkingDate } = req.body;

        const resignation = await prisma.resignation.findUnique({
            where: { id: resignationId }
        });

        if (!resignation) return res.status(404).json({ error: "Not found" });

        const lwdDate = finalLastWorkingDate ? new Date(finalLastWorkingDate) : resignation.lastWorkingDate;

        const updated = await prisma.resignation.update({
            where: { id: resignationId },
            data: {
                status: "Approved",
                remarks,
                lastWorkingDate: lwdDate
            }
        });

        // Generate Offboarding record & Checklist natively!
        const existingOffboarding = await prisma.offboarding.findFirst({
            where: { employeeId: updated.employeeId }
        });

        if (!existingOffboarding) {
            const offboarding = await prisma.offboarding.create({
                data: {
                    employeeId: updated.employeeId,
                    lastWorkingDate: lwdDate,
                    reason: "Resignation Approved",
                    status: "Pending"
                }
            });

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
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to approve resignation" });
    }
};

export const rejectResignation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const updated = await prisma.resignation.update({
            where: { id: parseInt(id as string, 10) },
            data: { status: "Rejected", remarks }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to reject resignation" });
    }
};
