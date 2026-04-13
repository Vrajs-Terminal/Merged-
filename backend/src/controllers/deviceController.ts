import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getDevices = async (req: Request, res: Response) => {
    try {
        const items = await prisma.device.findMany({
            include: { branch: true }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch devices" });
    }
};

export const createDevice = async (req: Request, res: Response) => {
    try {
        const { deviceName, deviceId, branchId, locationName, ipAddress, departmentRestriction, status } = req.body;
        const item = await prisma.device.create({
            data: {
                deviceName,
                deviceId,
                branchId: Number(branchId),
                locationName,
                ipAddress,
                departmentRestriction: departmentRestriction ? Number(departmentRestriction) : null,
                status: status || 'Active'
            }
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to create device" });
    }
};

export const updateDevice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { deviceName, deviceId, branchId, locationName, ipAddress, departmentRestriction, status } = req.body;
        const item = await prisma.device.update({
            where: { id: Number(id as string) },
            data: {
                deviceName,
                deviceId,
                ...(branchId ? { branchId: Number(branchId) } : {}),
                locationName,
                ipAddress,
                departmentRestriction: departmentRestriction ? Number(departmentRestriction) : null,
                status
            }
        });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to update device" });
    }
};

export const deleteDevice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await prisma.device.delete({
            where: { id: Number(id as string) },
        });
        res.json({ message: "Device deleted successfully", item });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete device" });
    }
};
