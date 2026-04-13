import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, categoryId, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (search) where.name = { contains: search as string };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        include: { category: true, subCategory: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// Get single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id as string) },
      include: { category: true, subCategory: true, variants: true }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, categoryId, subCategoryId, hsnCode, description, status = 'Active' } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ success: false, message: 'Product name and categoryId are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : undefined,
        hsnCode,
        description,
        status
      },
      include: { category: true, subCategory: true }
    });

    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Product name already exists' });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId, subCategoryId, hsnCode, description, status } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(subCategoryId && { subCategoryId: parseInt(subCategoryId) }),
        ...(hsnCode && { hsnCode }),
        ...(description && { description }),
        ...(status && { status })
      },
      include: { category: true, subCategory: true }
    });

    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// Toggle status
export const toggleProductStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const newStatus = product.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.product.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Product status updated successfully' });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ success: false, message: 'Failed to update product status' });
  }
};
