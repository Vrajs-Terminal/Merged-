import { type Request, type Response } from "express";
import prisma from '../lib/prismaClient';

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await prisma.expenseTemplate.findMany({
            include: { assignments: { include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(templates);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { templateName, description, expenseTypes, status } = req.body;
        const template = await prisma.expenseTemplate.create({
            data: { templateName, description, expenseTypes: expenseTypes || [], status: status || 'Active' }
        });
        res.status(201).json(template);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { templateName, description, expenseTypes, status } = req.body;
        const template = await prisma.expenseTemplate.update({
            where: { id: Number(id) },
            data: { templateName, description, expenseTypes: expenseTypes || [], status }
        });
        res.json(template);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.expenseTemplate.delete({ where: { id: Number(id) } });
        res.json({ message: 'Deleted' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const assignTemplate = async (req: Request, res: Response) => {
    try {
        const { templateId, employeeIds, department, branch } = req.body;
        
        if (!templateId) return res.status(400).json({ error: 'templateId required' });

        const created: any[] = [];
        await prisma.$transaction(async (tx) => {
            if (Array.isArray(employeeIds) && employeeIds.length > 0) {
                for (const empId of employeeIds) {
                    const rec = await tx.expenseTemplateAssignment.create({
                        data: { templateId: Number(templateId), employeeId: Number(empId), department: department || null, branch: branch || null }
                    });
                    created.push(rec);
                }
            } else {
                const rec = await tx.expenseTemplateAssignment.create({
                    data: { templateId: Number(templateId), department: department || null, branch: branch || null }
                });
                created.push(rec);
            }
        });

        res.status(201).json({ message: 'Assigned successfully', count: created.length });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getAssignments = async (req: Request, res: Response) => {
    try {
        const assignments = await prisma.expenseTemplateAssignment.findMany({
            include: {
                template: true,
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: true, branch: true } }
            },
            orderBy: { assignedAt: 'desc' }
        });
        res.json(assignments);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.expenseTemplateAssignment.delete({ where: { id: Number(id) } });
        res.json({ message: 'Assignment removed' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
