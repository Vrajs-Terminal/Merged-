import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';
import { logActivity } from "../services/activityLogger";

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const items = await prisma.department.findMany({
            include: { _count: { select: { Employee: true } } }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch departments" });
    }
};

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const { departmentName, branch_id, order_index } = req.body;
        const item = await prisma.department.create({
            data: { 
                name: departmentName, 
                branch_id: Number(branch_id),
                order_index: Number(order_index || 0)
            }
        });

        await logActivity(
            (req as any).user?.id || null,
            'CREATED',
            'DEPARTMENT',
            departmentName,
            { departmentId: item.id }
        );

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to create department" });
    }
};

export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { departmentName, branch_id, order_index } = req.body;
        const item = await prisma.department.update({
            where: { id: Number(id as string) },
            data: { 
                name: departmentName, 
                branch_id: Number(branch_id),
                order_index: Number(order_index)
            }
        });

        await logActivity(
            (req as any).user?.id || null,
            'UPDATED',
            'DEPARTMENT',
            departmentName,
            { departmentId: item.id }
        );

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to update department" });
    }
};

export const bulkTransferDepartment = async (req: Request, res: Response) => {
    try {
        const { employeeIds, newDepartmentId, effectiveDate, remarks } = req.body;
        if (!employeeIds || !employeeIds.length || !newDepartmentId || !effectiveDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const date = new Date(effectiveDate);

        await prisma.$transaction(async (tx) => {
            for (const empId of employeeIds) {
                const emp = await tx.employee.findUnique({ where: { id: empId } });
                if (!emp) continue;

                const oldVal = emp.departmentId || null;

                // Create history log
                await tx.employeeStructureHistory.create({
                    data: {
                        employeeId: empId,
                        transferType: 'Department',
                        oldValueId: oldVal,
                        newValueId: newDepartmentId,
                        effectiveDate: date,
                        remarks: remarks || null
                    }
                });

                // Update employee
                await tx.employee.update({
                    where: { id: empId },
                    data: { departmentId: newDepartmentId }
                });
            }
        });

        res.json({ message: "Successfully transferred employees" });
    } catch (error) {
        res.status(500).json({ error: "Failed to transfer employees" });
    }
};
