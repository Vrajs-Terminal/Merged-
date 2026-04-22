"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskPriority = exports.getTaskPriorities = exports.createTaskCategory = exports.getTaskCategories = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getTasks = async (req, res) => {
    try {
        const tasks = await prismaClient_1.default.task.findMany({
            include: {
                category: true,
                priority: true,
                assignedTo: true,
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    try {
        const { title, description, categoryId, priorityId, assignedToId, dueDate } = req.body;
        const task = await prismaClient_1.default.task.create({
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.categoryId)
            data.categoryId = parseInt(data.categoryId);
        if (data.priorityId)
            data.priorityId = parseInt(data.priorityId);
        if (data.assignedToId)
            data.assignedToId = parseInt(data.assignedToId);
        if (data.dueDate)
            data.dueDate = new Date(data.dueDate);
        if (data.completedAt)
            data.completedAt = new Date(data.completedAt);
        if (data.id)
            delete data.id;
        const task = await prismaClient_1.default.task.update({
            where: { id: parseInt(id) },
            data,
        });
        res.status(200).json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.task.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.deleteTask = deleteTask;
// Task Categories
const getTaskCategories = async (req, res) => {
    try {
        const categories = await prismaClient_1.default.taskCategory.findMany();
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getTaskCategories = getTaskCategories;
const createTaskCategory = async (req, res) => {
    try {
        const category = await prismaClient_1.default.taskCategory.create({
            data: req.body,
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createTaskCategory = createTaskCategory;
// Task Priorities
const getTaskPriorities = async (req, res) => {
    try {
        const priorities = await prismaClient_1.default.taskPriority.findMany({
            orderBy: { level: "asc" },
        });
        res.status(200).json(priorities);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getTaskPriorities = getTaskPriorities;
const createTaskPriority = async (req, res) => {
    try {
        const priority = await prismaClient_1.default.taskPriority.create({
            data: req.body,
        });
        res.status(201).json(priority);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createTaskPriority = createTaskPriority;
//# sourceMappingURL=taskController.js.map