import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all retailers
export const getAllRetailers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, distributorId, stateId, city, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (distributorId) where.distributorId = parseInt(distributorId as string);
    if (stateId) where.stateId = parseInt(stateId as string);
    if (city) where.city = { contains: city as string };
    if (search) where.name = { contains: search as string };

    const [retailers, total] = await Promise.all([
      prisma.retailer.findMany({
        where,
        skip,
        take: limitNum,
        include: { distributor: true, state: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.retailer.count({ where })
    ]);

    res.json({
      success: true,
      data: retailers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching retailers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch retailers' });
  }
};

// Get single retailer
export const getRetailer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const retailer = await prisma.retailer.findUnique({
      where: { id: parseInt(id as string) },
      include: { distributor: true, state: true }
    });

    if (!retailer) {
      return res.status(404).json({ success: false, message: 'Retailer not found' });
    }

    res.json({ success: true, data: retailer });
  } catch (error) {
    console.error('Error fetching retailer:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch retailer' });
  }
};

// Create retailer
export const createRetailer = async (req: Request, res: Response) => {
  try {
    const { name, contactNumber, distributorId, area, city, stateId, type, gst, status = 'Active' } = req.body;

    if (!name || !city || !distributorId) {
      return res.status(400).json({ success: false, message: 'Retailer name, city, and distributorId are required' });
    }

    const retailer = await prisma.retailer.create({
      data: {
        name,
        contactNumber,
        distributorId: parseInt(distributorId),
        area,
        city,
        stateId: stateId ? parseInt(stateId) : undefined,
        type,
        gst,
        status
      },
      include: { distributor: true, state: true }
    });

    res.status(201).json({ success: true, data: retailer, message: 'Retailer created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Retailer with this name in this distributor and city already exists' });
    }
    console.error('Error creating retailer:', error);
    res.status(500).json({ success: false, message: 'Failed to create retailer' });
  }
};

// Update retailer
export const updateRetailer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contactNumber, distributorId, area, city, stateId, type, gst, status } = req.body;

    const retailer = await prisma.retailer.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(name && { name }),
        ...(contactNumber && { contactNumber }),
        ...(distributorId && { distributorId: parseInt(distributorId) }),
        ...(area && { area }),
        ...(city && { city }),
        ...(stateId && { stateId: parseInt(stateId) }),
        ...(type && { type }),
        ...(gst && { gst }),
        ...(status && { status })
      },
      include: { distributor: true, state: true }
    });

    res.json({ success: true, data: retailer, message: 'Retailer updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Retailer not found' });
    }
    console.error('Error updating retailer:', error);
    res.status(500).json({ success: false, message: 'Failed to update retailer' });
  }
};

// Delete retailer
export const deleteRetailer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.retailer.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Retailer deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Retailer not found' });
    }
    console.error('Error deleting retailer:', error);
    res.status(500).json({ success: false, message: 'Failed to delete retailer' });
  }
};

// Toggle status
export const toggleRetailerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const retailer = await prisma.retailer.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!retailer) {
      return res.status(404).json({ success: false, message: 'Retailer not found' });
    }

    const newStatus = retailer.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.retailer.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Retailer status updated successfully' });
  } catch (error) {
    console.error('Error toggling retailer status:', error);
    res.status(500).json({ success: false, message: 'Failed to update retailer status' });
  }
};
