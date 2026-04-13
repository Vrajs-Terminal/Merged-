import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all customer categories
export const getAllCustomerCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) where.name = { contains: search as string };

    const [categories, total] = await Promise.all([
      prisma.customerCategory.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          subCategories: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customerCategory.count({ where })
    ]);

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        subCategoryCount: cat.subCategories.length
      }))
    );

    res.json({
      success: true,
      data: categoriesWithCounts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching customer categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer categories' });
  }
};

// Get single customer category
export const getCustomerCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.customerCategory.findUnique({
      where: { id: parseInt(id as string) },
      include: { subCategories: true }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Customer category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching customer category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer category' });
  }
};

// Create customer category
export const createCustomerCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, status = 'Active' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await prisma.customerCategory.create({
      data: {
        name,
        description,
        status
      }
    });

    res.status(201).json({ success: true, data: category, message: 'Customer category created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Customer category name already exists' });
    }
    console.error('Error creating customer category:', error);
    res.status(500).json({ success: false, message: 'Failed to create customer category' });
  }
};

// Update customer category
export const updateCustomerCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const category = await prisma.customerCategory.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status })
      }
    });

    res.json({ success: true, data: category, message: 'Customer category updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Customer category not found' });
    }
    console.error('Error updating customer category:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer category' });
  }
};

// Delete customer category
export const deleteCustomerCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.customerCategory.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Customer category deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Customer category not found' });
    }
    console.error('Error deleting customer category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete customer category' });
  }
};

// Toggle status
export const toggleCustomerCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.customerCategory.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Customer category not found' });
    }

    const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.customerCategory.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Customer category status updated successfully' });
  } catch (error) {
    console.error('Error toggling customer category status:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer category status' });
  }
};
