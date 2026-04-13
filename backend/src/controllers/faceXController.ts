import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

// --- Face App Admin ---

export const getFaceAppAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await prisma.faceAppAdmin.findMany({
            include: { manager: true },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(admins);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching admins", error: error.message });
    }
};

export const generateFaceAppAdmin = async (req: Request, res: Response) => {
    try {
        const { managerId } = req.body;
        const manager = await prisma.manager.findUnique({ where: { id: parseInt(managerId) } });
        if (!manager) return res.status(404).json({ message: "Manager not found" });

        const username = `FACEX_${manager.name?.replace(/\s+/g, '').toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const password = Math.random().toString(36).slice(-8).toUpperCase();

        const admin = await prisma.faceAppAdmin.create({
            data: {
                managerId: parseInt(managerId),
                username,
                password,
                status: "Active"
            }
        });

        res.status(201).json({ message: "Admin created successfully", admin });
    } catch (error: any) {
        res.status(500).json({ message: "Error creating admin", error: error.message });
    }
};

export const deleteFaceAppAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.faceAppAdmin.delete({ where: { id: parseInt(id as string) } });
        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Error deleting admin", error: error.message });
    }
};

export const toggleFaceAppAdminStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const admin = await prisma.faceAppAdmin.findUnique({ where: { id: parseInt(id as string) } });
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const updated = await prisma.faceAppAdmin.update({
            where: { id: parseInt(id as string) },
            data: { status: admin.status === "Active" ? "Inactive" : "Active" }
        });

        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({ message: "Error toggling status", error: error.message });
    }
};

// --- Face App Device ---

export const getFaceAppDevices = async (req: Request, res: Response) => {
    try {
        const { search, page = "1", limit = "25" } = req.query as any;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { deviceId: { contains: search } },
                { deviceMac: { contains: search } },
                { deviceModel: { contains: search } }
            ];
        }

        const [devices, total] = await Promise.all([
            prisma.faceAppDevice.findMany({
                where,
                include: { branch: true, admin: true },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: "desc" }
            }),
            prisma.faceAppDevice.count({ where })
        ]);

        res.status(200).json({ devices, total, pages: Math.ceil(total / parseInt(limit)) });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching devices", error: error.message });
    }
};

export const updateDeviceStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, remark } = req.body;
        const updated = await prisma.faceAppDevice.update({
            where: { id: parseInt(id as string) },
            data: { status, remark }
        });
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({ message: "Error updating device", error: error.message });
    }
};

// --- User Face Data ---

export const getUserFaceData = async (req: Request, res: Response) => {
    try {
        const { branch, department, employeeId } = req.query as any;
        const where: any = {};
        if (branch && branch !== "All") where.employee = { branch };
        if (department && department !== "All") where.employee = { ...where.employee, department };
        if (employeeId) where.employeeId = parseInt(employeeId);

        const data = await prisma.userFaceData.findMany({
            where,
            include: { 
                employee: { 
                    select: { firstName: true, lastName: true, branch: true, department: true, designation: true } 
                } 
            },
            orderBy: { lastUpdatedDate: "desc" }
        });
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching face data", error: error.message });
    }
};

export const deleteUserFaceData = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.userFaceData.delete({ where: { id: parseInt(id as string) } });
        res.status(200).json({ message: "Face data reset successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Error resetting face data", error: error.message });
    }
};

// --- Face Change Request ---

export const getFaceChangeRequests = async (req: Request, res: Response) => {
    try {
        const { status } = req.query as any;
        const where = status ? { status } : {};
        const requests = await prisma.faceChangeRequest.findMany({
            where,
            include: { 
                employee: { 
                    select: { firstName: true, lastName: true, branch: true, department: true, designation: true } 
                },
                device: true
            },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(requests);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching requests", error: error.message });
    }
};

export const handleFaceChangeRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const request = await prisma.faceChangeRequest.findUnique({ where: { id: parseInt(id as string) } });
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (status === "Approved") {
            // Update the actual face data
            await prisma.userFaceData.upsert({
                where: { employeeId: request.employeeId },
                update: { photoUrl: request.newPhotoUrl, lastUpdatedDate: new Date() },
                create: { employeeId: request.employeeId, photoUrl: request.newPhotoUrl }
            });
        }

        const updated = await prisma.faceChangeRequest.update({
            where: { id: parseInt(id as string) },
            data: { status, rejectionReason }
        });

        res.status(200).json({ message: `Request ${status} successfully`, updated });
    } catch (error: any) {
        res.status(500).json({ message: "Error processing request", error: error.message });
    }
};

// --- Face App Settings ---

export const getFaceAppSettings = async (req: Request, res: Response) => {
    try {
        let settings = await prisma.faceAppSetting.findFirst();
        if (!settings) {
            settings = await prisma.faceAppSetting.create({ data: {} });
        }
        res.status(200).json(settings);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching settings", error: error.message });
    }
};

export const updateFaceAppSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.faceAppSetting.findFirst();
        const id = settings?.id || 1;
        const updated = await prisma.faceAppSetting.upsert({
            where: { id },
            update: req.body,
            create: req.body
        });
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({ message: "Error updating settings", error: error.message });
    }
};
