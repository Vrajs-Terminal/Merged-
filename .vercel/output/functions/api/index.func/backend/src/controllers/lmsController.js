"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLmsProgress = exports.getLmsReport = exports.deleteLmsCourse = exports.updateLmsCourse = exports.createLmsCourse = exports.getLmsCourses = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const db = prismaClient_1.default;
const getLmsCourses = async (_req, res) => {
    try {
        const courses = await db.lmsCourse.findMany({ orderBy: { createdAt: "desc" } });
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getLmsCourses = getLmsCourses;
const createLmsCourse = async (req, res) => {
    try {
        const course = await db.lmsCourse.create({
            data: {
                name: req.body.name,
                category: req.body.category || "General",
                durationMinutes: Number(req.body.durationMinutes || 30),
                assignedCount: Number(req.body.assignedCount || 0),
                status: req.body.status || "Draft",
                description: req.body.description,
                passingGrade: Number(req.body.passingGrade || 70),
                contentUrl: req.body.contentUrl,
            },
        });
        res.status(201).json(course);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createLmsCourse = createLmsCourse;
const updateLmsCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await db.lmsCourse.update({
            where: { id: Number(id) },
            data: {
                name: req.body.name,
                category: req.body.category,
                durationMinutes: req.body.durationMinutes !== undefined ? Number(req.body.durationMinutes) : undefined,
                assignedCount: req.body.assignedCount !== undefined ? Number(req.body.assignedCount) : undefined,
                status: req.body.status,
                description: req.body.description,
                passingGrade: req.body.passingGrade !== undefined ? Number(req.body.passingGrade) : undefined,
                contentUrl: req.body.contentUrl,
            },
        });
        res.status(200).json(course);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateLmsCourse = updateLmsCourse;
const deleteLmsCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await db.lmsCourse.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Course deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.deleteLmsCourse = deleteLmsCourse;
const getLmsReport = async (_req, res) => {
    try {
        const progress = await db.lmsCourseProgress.findMany({
            include: { course: true },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(progress);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getLmsReport = getLmsReport;
const createLmsProgress = async (req, res) => {
    try {
        const record = await db.lmsCourseProgress.create({
            data: {
                courseId: Number(req.body.courseId),
                employeeId: req.body.employeeId ? Number(req.body.employeeId) : null,
                employeeName: req.body.employeeName,
                progress: Number(req.body.progress || 0),
                status: req.body.status || "Not Started",
                score: req.body.score,
                completedDate: req.body.completedDate ? new Date(req.body.completedDate) : null,
            },
        });
        res.status(201).json(record);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createLmsProgress = createLmsProgress;
//# sourceMappingURL=lmsController.js.map