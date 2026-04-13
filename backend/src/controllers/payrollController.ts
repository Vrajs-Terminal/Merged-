import express, { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

// Get Payroll Runs
export const getPayrollRuns = async (req: Request, res: Response): Promise<void> => {
    try {
        const runs = await prisma.payrollRun.findMany({
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            include: {
                _count: {
                    select: { payslips: true }
                }
            }
        });
        res.json({ runs });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch payroll runs." });
    }
};

// Generate Payroll for a given month/year
export const generatePayroll = async (req: any, res: Response): Promise<void> => {
    const { month, year } = req.body;

    if (!month || !year) {
        res.status(400).json({ error: "Month and Year are required." });
        return;
    }

    try {
        // 1. Check if run already exists
        let run = await prisma.payrollRun.findUnique({
            where: { month_year: { month, year } }
        });

        if (run && run.status !== "Draft") {
            res.status(400).json({ error: "Payroll already processed or paid for this month." });
            return;
        }

        if (!run) {
            run = await prisma.payrollRun.create({
                data: { month, year, status: "Draft" }
            });
        }

        // 2. Fetch all active employees with Finance details
        const employees = await prisma.employee.findMany({
            where: { status: "Active" }
        });

        // Delete existing draft payslips for this run (for re-generation)
        await prisma.payslip.deleteMany({
            where: { payrollRunId: run.id }
        });

        let totalCost = 0;
        let processedCount = 0;

        // 3. Generate Payslips
        for (const emp of employees) {
            // Very simplified base salary calculation for prototype
            // In a real app we'd fetch this from the `Finance` table
            const financeRecord = await prisma.finance.findFirst({
                where: { employeeId: emp.employeeId }
            });

            // Default to 50k if no record exists for visual MVP
            const baseSalary = financeRecord?.salary || 50000;

            const basic = baseSalary * 0.40;
            const hra = baseSalary * 0.20;
            const allowances = baseSalary * 0.40;

            const pfDeduction = basic * 0.12; // 12% of basic
            const taxDeduction = baseSalary > 60000 ? (baseSalary * 0.10) : 0;
            const totalDeductions = pfDeduction + taxDeduction;

            const grossSalary = basic + hra + allowances;
            const netSalary = grossSalary - totalDeductions;

            await prisma.payslip.create({
                data: {
                    payrollRunId: run.id,
                    employeeId: emp.id,
                    basic,
                    hra,
                    allowances,
                    pfDeduction,
                    taxDeduction,
                    grossSalary,
                    totalDeductions,
                    netSalary,
                    status: "Generated"
                }
            });

            totalCost += netSalary;
            processedCount++;
        }

        // 4. Update Run Totals
        const updatedRun = await prisma.payrollRun.update({
            where: { id: run.id },
            data: {
                totalEmployees: processedCount,
                totalCost,
                status: "Processed",
                processedBy: req.user.id,
                processedAt: new Date()
            }
        });

        res.json({ message: "Payroll generated successfully.", run: updatedRun });
    } catch (error) {
        console.error("Payroll Generation Error:", error);
        res.status(500).json({ error: "Failed to generate payroll." });
    }
};

// Fetch payslips for a specific run
export const getPayslips = async (req: Request, res: Response): Promise<void> => {
    try {
        const { runId } = req.params;
        const payslips = await prisma.payslip.findMany({
            where: { payrollRunId: parseInt(runId as string) },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        department: true
                    }
                }
            }
        });
        res.json({ payslips });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch payslips." });
    }
};

// Delete a payroll run
export const deletePayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
        const { runId } = req.params;
        await prisma.payrollRun.delete({
            where: { id: parseInt(runId as string) }
        });
        res.json({ message: "Payroll run deleted." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete payroll run." });
    }
};
