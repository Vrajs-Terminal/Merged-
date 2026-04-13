import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getDesignations = async (req: Request, res: Response) => {
    try {
        const items = await prisma.designation.findMany({
            include: { _count: { select: { employees: true } } }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch designations" });
    }
};

export const createDesignation = async (req: Request, res: Response) => {
    try {
        const { designationName, designationCode, description, status } = req.body;
        const item = await prisma.designation.create({
            data: { designationName, designationCode, description, status: status || 'Active' }
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to create designation" });
    }
};

export const updateDesignation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { designationName, designationCode, description, status } = req.body;
        const item = await prisma.designation.update({
            where: { id: Number(id as string) },
            data: { designationName, designationCode, description, status }
        });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to update designation" });
    }
};

export const bulkTransferDesignation = async (req: Request, res: Response) => {
    try {
        const { employeeIds, newDesignationId, effectiveDate, remarks } = req.body;
        if (!employeeIds || !employeeIds.length || !newDesignationId || !effectiveDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const date = new Date(effectiveDate);

        await prisma.$transaction(async (tx) => {
            for (const empId of employeeIds) {
                const emp = await tx.employee.findUnique({ where: { id: empId } });
                if (!emp) continue;

                const oldVal = emp.designationId || null;

                // Create history log
                await tx.employeeStructureHistory.create({
                    data: {
                        employeeId: empId,
                        transferType: 'Designation',
                        oldValueId: oldVal,
                        newValueId: newDesignationId,
                        effectiveDate: date,
                        remarks: remarks || null
                    }
                });

                // Update employee
                await tx.employee.update({
                    where: { id: empId },
                    data: { designationId: newDesignationId }
                });
            }
        });

        res.json({ message: "Successfully transferred employees" });
    } catch (error) {
        res.status(500).json({ error: "Failed to transfer employees" });
    }
};
