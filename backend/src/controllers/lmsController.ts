import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

const db = prisma as any;

export const getLmsCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await db.lmsCourse.findMany({ orderBy: { createdAt: "desc" } });
    res.status(200).json(courses);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createLmsCourse = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateLmsCourse = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteLmsCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.lmsCourse.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Course deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLmsReport = async (_req: Request, res: Response) => {
  try {
    const progress = await db.lmsCourseProgress.findMany({
      include: { course: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(progress);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createLmsProgress = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

