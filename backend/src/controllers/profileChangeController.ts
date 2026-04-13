import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

// Helper function to determine risk level
const calculateRiskLevel = (changeType: string): string => {
    const normalized = changeType.toLowerCase();
    if (normalized.includes("bank") || normalized.includes("name") || normalized.includes("pan") || normalized.includes("pf")) {
        return "High";
    }
    if (normalized.includes("email") || normalized.includes("mobile") || normalized.includes("phone")) {
        return "Medium";
    }
    return "Low";
};

// Create a new change request (Employee Side)
export const createProfileChangeRequest = async (req: Request, res: Response) => {
    try {
        const { employeeId, changeType, oldData, newData } = req.body;

        if (!employeeId || !changeType || !newData) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const employee = await prisma.employee.findUnique({
            where: { id: Number(employeeId as string) }
        });

        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        const riskLevel = calculateRiskLevel(changeType);

        const request = await prisma.profileChangeRequest.create({
            data: {
                employeeId: Number(employeeId),
                changeType,
                oldData: oldData || {},
                newData,
                riskLevel
            }
        });

        res.status(201).json(request);
    } catch (error) {
        console.error("Error creating profile change request:", error);
        res.status(500).json({ error: "Failed to create request" });
    }
};

// Get all requests (HR/Admin Side)
export const getProfileChangeRequests = async (req: Request, res: Response) => {
    try {
        const { status, riskLevel, branch, department } = req.query;

        const queryInfo: any = {
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        branch: true,
                        department: true
                    }
                }
            },
            where: {},
            orderBy: { createdAt: 'desc' }
        };

        if (status) queryInfo.where.status = status;
        if (riskLevel) queryInfo.where.riskLevel = riskLevel;

        // Filter by employee relation fields
        if (branch || department) {
            queryInfo.where.employee = {};
            if (branch) queryInfo.where.employee.branch = branch;
            if (department) queryInfo.where.employee.department = department;
        }

        const requests = await prisma.profileChangeRequest.findMany(queryInfo);
        res.json(requests);
    } catch (error) {
        console.error("Error fetching profile change requests:", error);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
};

// Approve Request
export const approveProfileChangeRequest = async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestId = Number(id as string);
    const { reviewedBy } = req.body;

    try {
        // 1. Fetch request
        const request = await prisma.profileChangeRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) return res.status(404).json({ error: "Request not found" });
        if (request.status !== "Pending") return res.status(400).json({ error: "Request is already processed" });

        // 2. Transaction to update Employee and Request
        const result = await prisma.$transaction(async (prisma) => {
            // Apply newData to Employee
            const updatedEmployee = await prisma.employee.update({
                where: { id: request.employeeId },
                data: request.newData as any // Using any for dynamic json apply. Validation should happen before.
            });

            // Mark request Approved
            const updatedRequest = await prisma.profileChangeRequest.update({
                where: { id: requestId },
                data: {
                    status: "Approved",
                    reviewedBy: reviewedBy ? Number(reviewedBy) : null
                }
            });

            return { updatedEmployee, updatedRequest };
        });

        res.json({ message: "Request approved and profile updated", data: result });
    } catch (error) {
        console.error("Error approving request:", error);
        // Identify prisma error vs code error
        res.status(500).json({ error: "Failed to approve request. Ensure data payload matches schema." });
    }
};

// Reject Request
export const rejectProfileChangeRequest = async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestId = Number(id as string);
    const { reviewedBy, rejectionReason } = req.body;

    try {
        if (!rejectionReason) return res.status(400).json({ error: "Rejection reason is mandatory" });

        const request = await prisma.profileChangeRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) return res.status(404).json({ error: "Request not found" });
        if (request.status !== "Pending") return res.status(400).json({ error: "Request is already processed" });

        const updatedRequest = await prisma.profileChangeRequest.update({
            where: { id: requestId },
            data: {
                status: "Rejected",
                reviewedBy: reviewedBy ? Number(reviewedBy) : null,
                rejectionReason
            }
        });

        res.json({ message: "Request rejected", data: updatedRequest });
    } catch (error) {
        console.error("Error rejecting request:", error);
        res.status(500).json({ error: "Failed to reject request" });
    }
};
