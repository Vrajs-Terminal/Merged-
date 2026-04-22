"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskPriority = exports.getTaskPriorities = exports.createTaskCategory = exports.getTaskCategories = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield prismaClient_1.default.task.findMany({
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
});
exports.getTasks = getTasks;
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, categoryId, priorityId, assignedToId, dueDate } = req.body;
        const task = yield prismaClient_1.default.task.create({
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
});
exports.createTask = createTask;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const task = yield prismaClient_1.default.task.update({
            where: { id: parseInt(id) },
            data,
        });
        res.status(200).json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.updateTask = updateTask;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.task.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.deleteTask = deleteTask;
// Task Categories
const getTaskCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prismaClient_1.default.taskCategory.findMany();
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getTaskCategories = getTaskCategories;
const createTaskCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield prismaClient_1.default.taskCategory.create({
            data: req.body,
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.createTaskCategory = createTaskCategory;
// Task Priorities
const getTaskPriorities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const priorities = yield prismaClient_1.default.taskPriority.findMany({
            orderBy: { level: "asc" },
        });
        res.status(200).json(priorities);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getTaskPriorities = getTaskPriorities;
const createTaskPriority = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const priority = yield prismaClient_1.default.taskPriority.create({
            data: req.body,
        });
        res.status(201).json(priority);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.createTaskPriority = createTaskPriority;
