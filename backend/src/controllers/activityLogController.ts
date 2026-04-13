import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

const db = prisma as any;

export const getActivityLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await db.activityLog.findMany({ orderBy: { dateTime: "desc" } });
    res.status(200).json(logs);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createActivityLog = async (req: Request, res: Response) => {
  try {
    const log = await db.activityLog.create({
      data: {
        dateTime: req.body.dateTime ? new Date(req.body.dateTime) : undefined,
        user: req.body.user || "System",
        module: req.body.module || "General",
        action: req.body.action || "View",
        description: req.body.description,
        ip: req.body.ip,
        device: req.body.device,
        by: req.body.by,
      },
    });
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

