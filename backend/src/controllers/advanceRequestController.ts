import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getRequests = async (req: Request, res: Response) => {
    try {
        const requests = await prisma.advanceSalaryRequest.findMany({
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to fetch advance requests" });
    }
};

export const createRequest = async (req: Request, res: Response) => {
    try {
        const { employeeId, requestedAmount, reason, attachment } = req.body;
        
        const request = await prisma.advanceSalaryRequest.create({
            data: {
                employee: { connect: { id: Number(employeeId) } },
                requestedAmount: Number(requestedAmount),
                reason,
                attachment,
                status: "Pending"
            }
        });
        
        res.status(201).json(request);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to submit request" });
    }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminRemark, approvedBy, givenMode, salaryMonth } = req.body;

        const request = await prisma.advanceSalaryRequest.findUnique({ where: { id: Number(id) } });
        if (!request) return res.status(404).json({ error: "Request not found" });
        if (request.status !== "Pending") return res.status(400).json({ error: "Request already processed" });

        await prisma.$transaction(async (tx) => {
            // Update request status
            await tx.advanceSalaryRequest.update({
                where: { id: Number(id) },
                data: {
                    status,
                    adminRemark,
                    approvedBy: approvedBy ? Number(approvedBy) : null,
                    approvalDate: new Date()
                }
            });

            // If approved, automatically create the AdvanceSalary record
            if (status === "Approved") {
                await tx.advanceSalary.create({
                    data: {
                        employee: { connect: { id: request.employeeId } },
                        amount: request.requestedAmount,
                        remainingAmount: request.requestedAmount,
                        salaryMonth: salaryMonth || new Date().toISOString().substring(0, 7),
                        givenDate: new Date(),
                        givenMode: givenMode || "Bank",
                        remark: `Approved from Request #${id}. ${adminRemark || ""}`,
                        status: "Pending"
                    }
                });
            }
        });

        res.json({ message: `Request successfully ${status?.toLowerCase()}` });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to process request" });
    }
};

export const deleteRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const existing = await prisma.advanceSalaryRequest.findUnique({ where: { id: Number(id) } });
        if (!existing) return res.status(404).json({ error: "Not found" });
        
        if (existing.status === "Approved") {
             return res.status(400).json({ error: "Cannot delete an approved request" });
        }

        await prisma.advanceSalaryRequest.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete request" });
    }
};
