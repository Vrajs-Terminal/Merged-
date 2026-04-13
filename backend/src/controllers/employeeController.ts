import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';
import { logActivity } from "../services/activityLogger";

// Helper to convert frontend "YYYY-MM-DD" back to ISO-8601 for Prisma
const parseDates = (data: any) => {
    const dateFields = ["dob", "doj", "trainingCompletionDate", "permanentDate", "insuranceExpiry"];
    const parsed = { ...data };

    dateFields.forEach(field => {
        const val = parsed[field];
        if (val && val !== "") {
            const date = new Date(val);
            parsed[field] = isNaN(date.getTime()) ? null : date;
        } else {
            parsed[field] = null;
        }
    });

    // Remove transient frontend fields if any
    delete parsed.countryCode;
    delete parsed.leaveGroup;
    delete parsed.multiLevelLeave;
    delete parsed.expenseApproval;
    delete parsed.active;

    // Social media fields are mapped to socialLinks
    delete parsed.facebook;
    delete parsed.linkedin;
    delete parsed.twitter;
    delete parsed.instagram;
    delete parsed.level;

    return parsed;
};

/* GET ALL ACTIVE EMPLOYEES */
export const getEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { createdAt: "desc" },
        });

        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

/* GET SINGLE EMPLOYEE */
export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const employee = await prisma.employee.findUnique({
            where: { employeeId: id },
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

/* CREATE EMPLOYEE */
export const createEmployee = async (req: Request, res: Response) => {
    try {
        console.log("CREATE EMPLOYEE REQUEST BODY:", req.body);
        const data = parseDates(req.body);
        console.log("PARSED DATA FOR PRISMA:", data);

        const activeEmployee = await prisma.employee.findUnique({
            where: { employeeId: data.employeeId },
        });

        if (activeEmployee) {
            return res.status(400).json({ message: "Employee with this ID already exists." });
        }

        const employee = await prisma.employee.create({
            data: data,
        });

        await logActivity(
            (req as any).user?.id || null,
            'ONBOARDED',
            'EMPLOYEE',
            `${employee.firstName} ${employee.lastName}`,
            { employeeId: employee.id }
        );

        res.status(201).json({ message: "Employee onboarded successfully", employee });
    } catch (error: any) {
        console.error("Create Employee Error:", error);
        res.status(500).json({ message: "Failed to create employee", error: error.message });
    }
};

/* UPDATE EMPLOYEE */
export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        console.log("UPDATE EMPLOYEE REQUEST BODY:", req.body);
        const data = parseDates(req.body);
        console.log("PARSED DATA FOR UPDATE:", data);

        const employee = await prisma.employee.update({
            where: { employeeId: id },
            data: data,
        });

        await logActivity(
            (req as any).user?.id || null,
            'UPDATED',
            'EMPLOYEE',
            `${employee.firstName} ${employee.lastName}`,
            { employeeId: employee.id }
        );

        res.status(200).json({ message: "Employee updated successfully", employee });
    } catch (error) {
        res.status(500).json({ message: "Failed to update employee", error });
    }
};

/* DISABLE EMPLOYEE (SOFT DELETE) */
export const disableEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        // 1. Get Employee
        const emp = await prisma.employee.findUnique({ where: { employeeId: id } });
        if (!emp) return res.status(404).json({ message: "Employee not found" });

        // 2. Change status
        const employee = await prisma.employee.update({
            where: { employeeId: id },
            data: { status: "Ex-Employee" },
        });

        // 3. Move to ExEmployee table (create record)
        const activeEx = await prisma.exEmployee.findFirst({ where: { employeeId: id } });
        if (!activeEx) {
            await prisma.exEmployee.create({
                data: {
                    employeeId: emp.employeeId,
                    firstName: emp.firstName,
                    middleName: emp.middleName,
                    lastName: emp.lastName,
                    email: emp.email,
                    mobile: emp.mobile,
                    designation: emp.designation,
                    department: emp.department,
                    branch: emp.branch,
                    exitDate: new Date(),
                    reason: "Terminated/Disabled",
                    eligibleForRehire: true,
                }
            });
        }

        res.status(200).json({ message: "Employee disabled successfully", employee });
        
        await logActivity(
            (req as any).user?.id || null,
            'DISABLED',
            'EMPLOYEE',
            `${employee.firstName} ${employee.lastName}`,
            { employeeId: employee.id }
        );
    } catch (error) {
        res.status(500).json({ message: "Failed to disable employee", error });
    }
};

/* REACTIVATE EMPLOYEE */
export const reactivateEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        // 1. Update Employee status
        const employee = await prisma.employee.update({
            where: { employeeId: id },
            data: { status: "Active" },
        });

        // 2. Remove from ExEmployee table
        await prisma.exEmployee.deleteMany({
            where: { employeeId: id },
        });

        res.status(200).json({ message: "Employee reactivated successfully", employee });

        await logActivity(
            (req as any).user?.id || null,
            'REACTIVATED',
            'EMPLOYEE',
            `${employee.firstName} ${employee.lastName}`,
            { employeeId: employee.id }
        );
    } catch (error) {
        res.status(500).json({ message: "Failed to reactivate employee", error });
    }
};

/* GET UPCOMING RETIREMENTS */
export const getUpcomingRetirements = async (req: Request, res: Response) => {
    try {
        const employees = await prisma.employee.findMany({
            where: {
                retirementAge: { not: null },
            },
        });

        // Filter calculation
        const upcoming = employees.filter((emp: any) => {
            const birth = new Date(emp.dob);
            const retirementDate = new Date(birth.setFullYear(birth.getFullYear() + emp.retirementAge));
            const diff = (retirementDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            return diff > 0 && diff <= 30 * 12; // Next 12 months
        });

        res.status(200).json(upcoming);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};