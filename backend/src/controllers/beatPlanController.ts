import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all beat plans
export const getAllBeatPlans = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, employeeId, weekDay, city, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId as string);
    if (weekDay) where.weekDay = weekDay;
    if (city) where.city = { contains: city as string };
    if (search) {
      where.OR = [
        { employee: { firstName: { contains: search as string } } },
        { employee: { employeeId: { contains: search as string } } }
      ];
    }

    const [beatPlans, total] = await Promise.all([
      prisma.beatPlan.findMany({
        where,
        skip,
        take: limitNum,
        include: { employee: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.beatPlan.count({ where })
    ]);

    res.json({
      success: true,
      data: beatPlans,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching beat plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch beat plans' });
  }
};

// Get single beat plan
export const getBeatPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const beatPlan = await prisma.beatPlan.findUnique({
      where: { id: parseInt(id as string) },
      include: { employee: true }
    });

    if (!beatPlan) {
      return res.status(404).json({ success: false, message: 'Beat plan not found' });
    }

    res.json({ success: true, data: beatPlan });
  } catch (error) {
    console.error('Error fetching beat plan:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch beat plan' });
  }
};

// Create beat plan
export const createBeatPlan = async (req: Request, res: Response) => {
  try {
    const { employeeId, weekDay, retailerCount, city, status = 'Active' } = req.body;

    if (!employeeId || !weekDay) {
      return res.status(400).json({ success: false, message: 'employeeId and weekDay are required' });
    }

    const beatPlan = await prisma.beatPlan.create({
      data: {
        employeeId: parseInt(employeeId),
        weekDay,
        retailerCount: retailerCount ? parseInt(retailerCount) : undefined,
        city,
        status
      },
      include: { employee: true }
    });

    res.status(201).json({ success: true, data: beatPlan, message: 'Beat plan created successfully' });
  } catch (error) {
    console.error('Error creating beat plan:', error);
    res.status(500).json({ success: false, message: 'Failed to create beat plan' });
  }
};

// Update beat plan
export const updateBeatPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { weekDay, retailerCount, city, status } = req.body;

    const beatPlan = await prisma.beatPlan.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(weekDay && { weekDay }),
        ...(retailerCount && { retailerCount: parseInt(retailerCount) }),
        ...(city && { city }),
        ...(status && { status })
      },
      include: { employee: true }
    });

    res.json({ success: true, data: beatPlan, message: 'Beat plan updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Beat plan not found' });
    }
    console.error('Error updating beat plan:', error);
    res.status(500).json({ success: false, message: 'Failed to update beat plan' });
  }
};

// Delete beat plan
export const deleteBeatPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.beatPlan.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Beat plan deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Beat plan not found' });
    }
    console.error('Error deleting beat plan:', error);
    res.status(500).json({ success: false, message: 'Failed to delete beat plan' });
  }
};

// Toggle status
export const toggleBeatPlanStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const beatPlan = await prisma.beatPlan.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!beatPlan) {
      return res.status(404).json({ success: false, message: 'Beat plan not found' });
    }

    const newStatus = beatPlan.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.beatPlan.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Beat plan status updated successfully' });
  } catch (error) {
    console.error('Error toggling beat plan status:', error);
    res.status(500).json({ success: false, message: 'Failed to update beat plan status' });
  }
};
