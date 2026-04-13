import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                category: true,
                priority: true,
                assignedTo: true,
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, categoryId, priorityId, assignedToId, dueDate } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                priorityId: priorityId ? parseInt(priorityId) : undefined,
                assignedToId: assignedToId ? parseInt(assignedToId) : undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                status: "Pending",
            },
        });
        res.status(201).json(task);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        if (data.categoryId) data.categoryId = parseInt(data.categoryId as string);
        if (data.priorityId) data.priorityId = parseInt(data.priorityId as string);
        if (data.assignedToId) data.assignedToId = parseInt(data.assignedToId as string);
        if (data.dueDate) data.dueDate = new Date(data.dueDate);
        if (data.completedAt) data.completedAt = new Date(data.completedAt);
        if (data.id) delete data.id;

        const task = await prisma.task.update({
            where: { id: parseInt(id as string) },
            data,
        });
        res.status(200).json(task);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({
            where: { id: parseInt(id as string) },
        });
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Task Categories
export const getTaskCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.taskCategory.findMany();
        res.status(200).json(categories);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createTaskCategory = async (req: Request, res: Response) => {
    try {
        const category = await prisma.taskCategory.create({
            data: req.body,
        });
        res.status(201).json(category);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Task Priorities
export const getTaskPriorities = async (req: Request, res: Response) => {
    try {
        const priorities = await prisma.taskPriority.findMany({
            orderBy: { level: "asc" },
        });
        res.status(200).json(priorities);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createTaskPriority = async (req: Request, res: Response) => {
    try {
        const priority = await prisma.taskPriority.create({
            data: req.body,
        });
        res.status(201).json(priority);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
