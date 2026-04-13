import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

const db = prisma as any;

export const getAppBanners = async (_req: Request, res: Response) => {
  try {
    const banners = await db.appBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
    res.status(200).json(banners);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createAppBanner = async (req: Request, res: Response) => {
  try {
    const banner = await db.appBanner.create({
      data: {
        image: req.body.image,
        title: req.body.title,
        type: req.body.type || "Image",
        active: req.body.active ?? true,
        schedule: req.body.schedule,
        actionValue: req.body.actionValue,
        sortOrder: Number(req.body.sortOrder || 0),
      },
    });
    res.status(201).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateAppBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await db.appBanner.update({
      where: { id: Number(id) },
      data: {
        image: req.body.image,
        title: req.body.title,
        type: req.body.type,
        active: req.body.active,
        schedule: req.body.schedule,
        actionValue: req.body.actionValue,
        sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : undefined,
      },
    });
    res.status(200).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleAppBannerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.appBanner.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const banner = await db.appBanner.update({
      where: { id: Number(id) },
      data: { active: !existing.active },
    });
    res.status(200).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteAppBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.appBanner.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Banner deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

