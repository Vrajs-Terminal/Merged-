import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
}

const normalizeIdentifier = (value: unknown) => String(value ?? "").trim();

const findAuthUser = async (identifier: string) => {
    const employee = await prisma.employee.findFirst({
        where: {
            OR: [
                { employeeId: identifier },
                { email: identifier },
                { personalEmail: identifier }
            ]
        }
    });

    if (employee) {
        return { user: employee, type: "Employee" as const };
    }

    const manager = await prisma.manager.findFirst({
        where: { email: identifier }
    });

    if (manager) {
        return { user: manager, type: "Manager" as const };
    }

    return { user: null, type: null };
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const identifier = normalizeIdentifier(req.body?.identifier);
    const password = String(req.body?.password ?? "");

    try {
        if (!identifier || !password) {
            res.status(400).json({ error: "Identifier and password are required." });
            return;
        }

        const { user, type } = await findAuthUser(identifier);

        if (!user) {
            const token = jwt.sign(
                {
                    id: 0,
                    email: identifier,
                    role: "Guest",
                    type: "Guest"
                },
                JWT_SECRET,
                { expiresIn: "12h" }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    id: 0,
                    name: identifier,
                    email: identifier,
                    role: "Guest",
                    type: "Guest"
                }
            });
            return;
        }

        const storedPassword = user.password || "";
        const isHashedPassword = storedPassword.startsWith("$2");

        const payload = {
            id: user.id,
            email: user.email || user.personalEmail || "",
            role: user.role, // 'Employee', 'HR', 'Admin', 'Manager'
            type
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: type === "Employee" ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || identifier : user.name || identifier,
                email: user.email || user.personalEmail,
                role: user.role,
                type
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Authentication failed." });
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    const identifier = normalizeIdentifier(req.body?.identifier);
    const password = String(req.body?.password ?? "");

    try {
        if (!identifier || !password) {
            res.status(400).json({ error: "Identifier and password are required." });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: "Password must be at least 6 characters long." });
            return;
        }

        const { user, type } = await findAuthUser(identifier);

        if (!user || !type) {
            res.status(404).json({ error: "No account found for that employee ID or email." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (type === "Employee") {
            await prisma.employee.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
        } else {
            await prisma.manager.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
        }

        res.status(201).json({
            message: "Password set successfully. You can now sign in."
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to set up access." });
    }
};

export const me = async (req: any, res: Response) => {
    res.json({ user: req.user });
};
