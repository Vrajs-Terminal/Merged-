import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all distributors
export const getAllDistributors = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, countryId, stateId, city, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (countryId) where.countryId = parseInt(countryId as string);
    if (stateId) where.stateId = parseInt(stateId as string);
    if (city) where.city = { contains: city as string };
    if (search) where.name = { contains: search as string };

    const [distributors, total] = await Promise.all([
      prisma.distributor.findMany({
        where,
        skip,
        take: limitNum,
        include: { country: true, state: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.distributor.count({ where })
    ]);

    res.json({
      success: true,
      data: distributors,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch distributors' });
  }
};

// Get single distributor
export const getDistributor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const distributor = await prisma.distributor.findUnique({
      where: { id: parseInt(id as string) },
      include: { country: true, state: true, retailers: true }
    });

    if (!distributor) {
      return res.status(404).json({ success: false, message: 'Distributor not found' });
    }

    res.json({ success: true, data: distributor });
  } catch (error) {
    console.error('Error fetching distributor:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch distributor' });
  }
};

// Create distributor
export const createDistributor = async (req: Request, res: Response) => {
  try {
    const {
      name,
      contactPerson,
      contactNumber,
      orderEmail,
      distributorEmail,
      countryId,
      stateId,
      city,
      type,
      status = 'Active'
    } = req.body;

    if (!name || !city) {
      return res.status(400).json({ success: false, message: 'Distributor name and city are required' });
    }

    const distributor = await prisma.distributor.create({
      data: {
        name,
        contactPerson,
        contactNumber,
        orderEmail,
        distributorEmail,
        countryId: countryId ? parseInt(countryId) : undefined,
        stateId: stateId ? parseInt(stateId) : undefined,
        city,
        type,
        status
      },
      include: { country: true, state: true }
    });

    res.status(201).json({ success: true, data: distributor, message: 'Distributor created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Distributor with this name and city already exists' });
    }
    console.error('Error creating distributor:', error);
    res.status(500).json({ success: false, message: 'Failed to create distributor' });
  }
};

// Update distributor
export const updateDistributor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contactPerson, contactNumber, orderEmail, distributorEmail, countryId, stateId, city, type, status } = req.body;

    const distributor = await prisma.distributor.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(name && { name }),
        ...(contactPerson && { contactPerson }),
        ...(contactNumber && { contactNumber }),
        ...(orderEmail && { orderEmail }),
        ...(distributorEmail && { distributorEmail }),
        ...(countryId && { countryId: parseInt(countryId) }),
        ...(stateId && { stateId: parseInt(stateId) }),
        ...(city && { city }),
        ...(type && { type }),
        ...(status && { status })
      },
      include: { country: true, state: true }
    });

    res.json({ success: true, data: distributor, message: 'Distributor updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Distributor not found' });
    }
    console.error('Error updating distributor:', error);
    res.status(500).json({ success: false, message: 'Failed to update distributor' });
  }
};

// Delete distributor
export const deleteDistributor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.distributor.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Distributor deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Distributor not found' });
    }
    console.error('Error deleting distributor:', error);
    res.status(500).json({ success: false, message: 'Failed to delete distributor' });
  }
};

// Toggle status
export const toggleDistributorStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const distributor = await prisma.distributor.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!distributor) {
      return res.status(404).json({ success: false, message: 'Distributor not found' });
    }

    const newStatus = distributor.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.distributor.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Distributor status updated successfully' });
  } catch (error) {
    console.error('Error toggling distributor status:', error);
    res.status(500).json({ success: false, message: 'Failed to update distributor status' });
  }
};
