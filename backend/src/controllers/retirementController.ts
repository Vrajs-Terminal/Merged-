import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getUpcomingRetirements = async (req: Request, res: Response) => {
    try {
        const { timeframe, branchId, departmentId, search } = req.query;
        // timeframe in months (e.g., 1, 3, 6, 12, or all)

        // Find all active employees that have DOB
        const filters: any = {
            status: "Active",
            dob: { not: null },
            retirementAge: { not: null }
        };

        if (branchId) filters.branchId = parseInt(branchId as string);
        if (departmentId) filters.departmentId = parseInt(departmentId as string);
        if (search) {
            filters.OR = [
                { firstName: { contains: search as string } },
                { lastName: { contains: search as string } },
                { employeeId: { contains: search as string } }
            ];
        }

        const employees = await prisma.employee.findMany({
            where: filters,
            include: {
                branchRef: true,
                departmentRef: true,
                designationRef: true
            }
        });

        const now = new Date();
        const upcomingRetirements = [];

        for (const emp of employees) {
            if (!emp.dob || !emp.retirementAge) continue;

            // Calculate Retirement Date
            const retirementDate = new Date(emp.dob);
            retirementDate.setFullYear(retirementDate.getFullYear() + emp.retirementAge);

            // Calculate Days Until Retirement
            const timeDiff = retirementDate.getTime() - now.getTime();
            const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

            // Not yet retired and within our bounds
            if (daysUntil >= 0) {
                // If timeframe is provided, filter
                if (timeframe) {
                    const maxDays = parseInt(timeframe as string) * 30; // approx
                    if (daysUntil > maxDays) continue;
                }

                upcomingRetirements.push({
                    id: emp.id,
                    employeeId: emp.employeeId,
                    name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
                    designation: emp.designationRef?.designationName || emp.designation || "—",
                    department: emp.departmentRef?.departmentName || emp.department || "—",
                    branch: emp.branchRef?.branchName || emp.branch || "—",
                    dob: emp.dob,
                    retirementAge: emp.retirementAge,
                    retirementDate,
                    daysUntil
                });
            }
        }

        // Sort by days until retirement (soonest first)
        upcomingRetirements.sort((a, b) => a.daysUntil - b.daysUntil);

        res.json(upcomingRetirements);
    } catch (error) {
        console.error("Error fetching retirements:", error);
        res.status(500).json({ error: "Failed to fetch upcoming retirements" });
    }
};
