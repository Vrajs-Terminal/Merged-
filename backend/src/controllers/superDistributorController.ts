import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all super distributors
export const getAllSuperDistributors = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) where.name = { contains: search as string };

    const [superDistributors, total] = await Promise.all([
      prisma.superDistributor.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.superDistributor.count({ where })
    ]);

    res.json({
      success: true,
      data: superDistributors,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching super distributors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch super distributors' });
  }
};

// Get single super distributor
export const getSuperDistributor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const superDistributor = await prisma.superDistributor.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!superDistributor) {
      return res.status(404).json({ success: false, message: 'Super distributor not found' });
    }

    res.json({ success: true, data: superDistributor });
  } catch (error) {
    console.error('Error fetching super distributor:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch super distributor' });
  }
};

// Create super distributor
export const createSuperDistributor = async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, contactNumber, orderEmail, photo, status = 'Active' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Super distributor name is required' });
    }

    const superDistributor = await prisma.superDistributor.create({
      data: {
        name,
        contactPerson,
        contactNumber,
        orderEmail,
        photo,
        status
      }
    });

    res.status(201).json({ success: true, data: superDistributor, message: 'Super distributor created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Super distributor name already exists' });
    }
    console.error('Error creating super distributor:', error);
    res.status(500).json({ success: false, message: 'Failed to create super distributor' });
  }
};

// Update super distributor
export const updateSuperDistributor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contactPerson, contactNumber, orderEmail, photo, status } = req.body;

    const superDistributor = await prisma.superDistributor.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(name && { name }),
        ...(contactPerson && { contactPerson }),
        ...(contactNumber && { contactNumber }),
        ...(orderEmail && { orderEmail }),
        ...(photo && { photo }),
        ...(status && { status })
      }
    });

    res.json({ success: true, data: superDistributor, message: 'Super distributor updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Super distributor not found' });
    }
    console.error('Error updating super distributor:', error);
    res.status(500).json({ success: false, message: 'Failed to update super distributor' });
  }
};

// Delete super distributor
export const deleteSuperDistributor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.superDistributor.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Super distributor deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Super distributor not found' });
    }
    console.error('Error deleting super distributor:', error);
    res.status(500).json({ success: false, message: 'Failed to delete super distributor' });
  }
};

// Toggle status
export const toggleSuperDistributorStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const superDistributor = await prisma.superDistributor.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!superDistributor) {
      return res.status(404).json({ success: false, message: 'Super distributor not found' });
    }

    const newStatus = superDistributor.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.superDistributor.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Super distributor status updated successfully' });
  } catch (error) {
    console.error('Error toggling super distributor status:', error);
    res.status(500).json({ success: false, message: 'Failed to update super distributor status' });
  }
};
