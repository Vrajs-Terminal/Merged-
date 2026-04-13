import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all product categories with pagination
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where = search ? {
      name: { contains: search as string }
    } : undefined;

    const [categories, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.productCategory.count({ where })
    ]);

    res.json({
      success: true,
      data: categories,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// Get single category
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.productCategory.findUnique({
      where: { id: parseInt(id as string) },
      include: { products: true, subCategories: true }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
};

// Create category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, status = 'Active' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await prisma.productCategory.create({
      data: {
        name,
        description,
        status
      }
    });

    res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const category = await prisma.productCategory.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status })
      }
    });

    res.json({ success: true, data: category, message: 'Category updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.productCategory.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

// Toggle status
export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.productCategory.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.productCategory.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Category status updated successfully' });
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({ success: false, message: 'Failed to update category status' });
  }
};
