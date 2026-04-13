import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getExEmployees = async (req: Request, res: Response) => {
    try {
        const exEmployees = await prisma.exEmployee.findMany();
        res.status(200).json(exEmployees);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const createExEmployee = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        // ensure date parses correctly if provided as string
        if (data.exitDate) data.exitDate = new Date(data.exitDate);
        const exEmployee = await prisma.exEmployee.create({
            data,
        });
        res.status(201).json(exEmployee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getExEmployeeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const exEmployee = await prisma.exEmployee.findFirst({
            where: { employeeId: id },
        });
        if (!exEmployee) {
            res.status(404).json({ message: "ExEmployee not found" });
            return;
        }
        res.status(200).json(exEmployee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
