import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getAdvanceSalaries = async (req: Request, res: Response) => {
    try {
        const advances = await prisma.advanceSalary.findMany({
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
                returns: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(advances);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to fetch advance salaries" });
    }
};

export const createAdvanceSalary = async (req: Request, res: Response) => {
    try {
        const { employeeId, amount, givenDate, ...rest } = req.body;
        
        // Prisma requires full ISO-8601 DateTime — convert "YYYY-MM-DD" to Date object
        const parsedGivenDate = givenDate ? new Date(givenDate + "T00:00:00.000Z") : new Date();
        
        const advance = await prisma.advanceSalary.create({
            data: {
                ...rest,
                employee: { connect: { id: Number(employeeId) } },
                amount: Number(amount),
                remainingAmount: Number(amount),
                givenDate: parsedGivenDate
            }
        });
        
        res.status(201).json(advance);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create advance salary" });
    }
};

export const createBulkAdvanceSalary = async (req: Request, res: Response) => {
    try {
        const { employees, amount, salaryMonth, givenDate, givenMode, remark } = req.body;
        
        if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({ error: "No employees selected" });
        }

        // Use async callback-style transaction for TiDB compatibility
        const results: any[] = [];
        await prisma.$transaction(async (tx) => {
            for (const empId of employees) {
                const record = await tx.advanceSalary.create({
                    data: {
                        employee: { connect: { id: Number(empId) } },
                        amount: Number(amount),
                        remainingAmount: Number(amount),
                        salaryMonth,
                        givenDate: new Date(givenDate),
                        givenMode: givenMode || "Bank",
                        remark: remark || "",
                        status: "Pending"
                    }
                });
                results.push(record);
            }
        });
        
        res.status(201).json({ message: "Bulk assigned successfully", count: results.length });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create bulk advances" });
    }
};

export const updateAdvanceSalary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, ...rest } = req.body;

        const existing = await prisma.advanceSalary.findUnique({ where: { id: Number(id) } });
        if (!existing) return res.status(404).json({ error: "Not found" });

        // Calculate new remaining amount if amount changes
        const amountDiff = Number(amount) - existing.amount;
        const newRemaining = existing.remainingAmount + amountDiff;

        const advance = await prisma.advanceSalary.update({
            where: { id: Number(id) },
            data: {
                ...rest,
                amount: Number(amount),
                remainingAmount: newRemaining >= 0 ? newRemaining : 0,
                status: newRemaining <= 0 ? "Returned" : existing.status
            }
        });
        
        res.json(advance);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update advance salary" });
    }
};

export const deleteAdvanceSalary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.advanceSalary.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete advance salary" });
    }
};

export const returnAdvanceSalary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, returnDate, remark, adjustedInPayroll } = req.body;

        const advance = await prisma.advanceSalary.findUnique({ where: { id: Number(id) } });
        if (!advance) return res.status(404).json({ error: "Advance record not found" });
        if (advance.remainingAmount <= 0) return res.status(400).json({ error: "Already fully returned" });

        const returnAmt = Number(amount);
        if (returnAmt > advance.remainingAmount) return res.status(400).json({ error: "Return amount exceeds remaining amount" });

        await prisma.$transaction(async (tx) => {
            // 1. Create return record
            await tx.advanceSalaryReturn.create({
                data: {
                    advance: { connect: { id: Number(id) } },
                    amount: returnAmt,
                    returnDate: new Date(returnDate),
                    remark,
                    adjustedInPayroll: adjustedInPayroll || false
                }
            });

            // 2. Update remaining balance and status
            const newRemaining = advance.remainingAmount - returnAmt;
            await tx.advanceSalary.update({
                where: { id: Number(id) },
                data: {
                    remainingAmount: newRemaining,
                    status: newRemaining === 0 ? "Returned" : "Pending"
                }
            });
        });

        res.json({ message: "Return processed successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to process return" });
    }
};
