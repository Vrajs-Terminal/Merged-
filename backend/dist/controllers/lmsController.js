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
exports.createLmsProgress = exports.getLmsReport = exports.deleteLmsCourse = exports.updateLmsCourse = exports.createLmsCourse = exports.getLmsCourses = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const db = prismaClient_1.default;
const getLmsCourses = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield db.lmsCourse.findMany({ orderBy: { createdAt: "desc" } });
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getLmsCourses = getLmsCourses;
const createLmsCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield db.lmsCourse.create({
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
});
exports.createLmsCourse = createLmsCourse;
const updateLmsCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const course = yield db.lmsCourse.update({
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
});
exports.updateLmsCourse = updateLmsCourse;
const deleteLmsCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield db.lmsCourse.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Course deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.deleteLmsCourse = deleteLmsCourse;
const getLmsReport = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const progress = yield db.lmsCourseProgress.findMany({
            include: { course: true },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(progress);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getLmsReport = getLmsReport;
const createLmsProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const record = yield db.lmsCourseProgress.create({
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
});
exports.createLmsProgress = createLmsProgress;
