import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

const db = prisma as any;

export const getAdminAccessRules = async (_req: Request, res: Response) => {
  try {
    const rules = await db.adminAccessRule.findMany({ orderBy: { createdAt: "desc" } });
    res.status(200).json(rules);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createAdminAccessRule = async (req: Request, res: Response) => {
  try {
    const rule = await db.adminAccessRule.create({
      data: {
        employeeName: req.body.employeeName,
        designation: req.body.designation,
        parentModule: req.body.parentModule,
        submodule: req.body.submodule,
        accessFor: req.body.accessFor,
        accessMode: req.body.accessMode,
        teamRequestNeeded: Boolean(req.body.teamRequestNeeded),
      },
    });
    res.status(201).json(rule);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteAdminAccessRule = async (req: Request, res: Response) => {
  try {
    await db.adminAccessRule.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ message: "Rule deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAdminPermissionConfig = async (_req: Request, res: Response) => {
  try {
    const key = "default";
    const record = await db.adminPermissionSetting.findUnique({ where: { key } });
    res.status(200).json(record?.payload || null);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const saveAdminPermissionConfig = async (req: Request, res: Response) => {
  try {
    const key = "default";
    const record = await db.adminPermissionSetting.upsert({
      where: { key },
      update: { payload: req.body },
      create: { key, payload: req.body },
    });
    res.status(200).json(record.payload);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAppSettingsConfig = async (_req: Request, res: Response) => {
  try {
    const key = "global";
    const record = await db.appSettingsConfig.findUnique({ where: { key } });
    res.status(200).json(record?.payload || null);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const saveAppSettingsConfig = async (req: Request, res: Response) => {
  try {
    const key = "global";
    const record = await db.appSettingsConfig.upsert({
      where: { key },
      update: { payload: req.body },
      create: { key, payload: req.body },
    });
    res.status(200).json(record.payload);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOrderSettingsConfig = async (_req: Request, res: Response) => {
  try {
    const key = "order-global";
    const record = await db.appSettingsConfig.findUnique({ where: { key } });
    res.status(200).json(record?.payload || null);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const saveOrderSettingsConfig = async (req: Request, res: Response) => {
  try {
    const key = "order-global";
    const record = await db.appSettingsConfig.upsert({
      where: { key },
      update: { payload: req.body },
      create: { key, payload: req.body },
    });
    res.status(200).json(record.payload);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

