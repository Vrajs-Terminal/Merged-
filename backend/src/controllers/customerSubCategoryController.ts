import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all customer sub categories
export const getAllCustomerSubCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, categoryId, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (search) where.name = { contains: search as string };

    const [subCategories, total] = await Promise.all([
      prisma.customerSubCategory.findMany({
        where,
        skip,
        take: limitNum,
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customerSubCategory.count({ where })
    ]);

    res.json({
      success: true,
      data: subCategories,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching customer sub categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer sub categories' });
  }
};

// Get single customer sub category
export const getCustomerSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subCategory = await prisma.customerSubCategory.findUnique({
      where: { id: parseInt(id as string) },
      include: { category: true }
    });

    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Customer sub category not found' });
    }

    res.json({ success: true, data: subCategory });
  } catch (error) {
    console.error('Error fetching customer sub category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer sub category' });
  }
};

// Create customer sub category
export const createCustomerSubCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId, name, description, status = 'Active' } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({ success: false, message: 'categoryId and name are required' });
    }

    const subCategory = await prisma.customerSubCategory.create({
      data: {
        categoryId: parseInt(categoryId),
        name,
        description,
        status
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, data: subCategory, message: 'Customer sub category created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Sub category with this name already exists in this category' });
    }
    console.error('Error creating customer sub category:', error);
    res.status(500).json({ success: false, message: 'Failed to create customer sub category' });
  }
};

// Update customer sub category
export const updateCustomerSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const subCategory = await prisma.customerSubCategory.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status })
      },
      include: { category: true }
    });

    res.json({ success: true, data: subCategory, message: 'Customer sub category updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Customer sub category not found' });
    }
    console.error('Error updating customer sub category:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer sub category' });
  }
};

// Delete customer sub category
export const deleteCustomerSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.customerSubCategory.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Customer sub category deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Customer sub category not found' });
    }
    console.error('Error deleting customer sub category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete customer sub category' });
  }
};

// Toggle status
export const toggleCustomerSubCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subCategory = await prisma.customerSubCategory.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Customer sub category not found' });
    }

    const newStatus = subCategory.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.customerSubCategory.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Customer sub category status updated successfully' });
  } catch (error) {
    console.error('Error toggling customer sub category status:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer sub category status' });
  }
};
