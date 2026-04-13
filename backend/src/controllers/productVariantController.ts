import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all variants
export const getAllVariants = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, productId, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (productId) where.productId = parseInt(productId as string);
    if (search) where.variantName = { contains: search as string };

    const [variants, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        skip,
        take: limitNum,
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.productVariant.count({ where })
    ]);

    res.json({
      success: true,
      data: variants,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch variants' });
  }
};

// Get single variant
export const getVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const variant = await prisma.productVariant.findUnique({
      where: { id: parseInt(id as string) },
      include: { product: { include: { category: true, subCategory: true } } }
    });

    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    res.json({ success: true, data: variant });
  } catch (error) {
    console.error('Error fetching variant:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch variant' });
  }
};

// Create variant
export const createVariant = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      variantName,
      sku,
      bulkType,
      perBoxPiece,
      retailerSellingPrice,
      mrp,
      manufacturingCost,
      unit,
      photo,
      status = 'Active'
    } = req.body;

    if (!productId || !variantName || !sku || !retailerSellingPrice || !mrp || !manufacturingCost) {
      return res.status(400).json({
        success: false,
        message: 'productId, variantName, sku, retailerSellingPrice, mrp, and manufacturingCost are required'
      });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: parseInt(productId),
        variantName,
        sku,
        bulkType,
        perBoxPiece: perBoxPiece ? parseInt(perBoxPiece) : undefined,
        retailerSellingPrice: parseFloat(retailerSellingPrice),
        mrp: parseFloat(mrp),
        manufacturingCost: parseFloat(manufacturingCost),
        unit,
        photo,
        status
      },
      include: { product: { include: { category: true } } }
    });

    res.status(201).json({ success: true, data: variant, message: 'Variant created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    console.error('Error creating variant:', error);
    res.status(500).json({ success: false, message: 'Failed to create variant' });
  }
};

// Update variant
export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      variantName,
      sku,
      bulkType,
      perBoxPiece,
      retailerSellingPrice,
      mrp,
      manufacturingCost,
      unit,
      photo,
      status
    } = req.body;

    const variant = await prisma.productVariant.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(variantName && { variantName }),
        ...(sku && { sku }),
        ...(bulkType && { bulkType }),
        ...(perBoxPiece && { perBoxPiece: parseInt(perBoxPiece) }),
        ...(retailerSellingPrice && { retailerSellingPrice: parseFloat(retailerSellingPrice) }),
        ...(mrp && { mrp: parseFloat(mrp) }),
        ...(manufacturingCost && { manufacturingCost: parseFloat(manufacturingCost) }),
        ...(unit && { unit }),
        ...(photo && { photo }),
        ...(status && { status })
      },
      include: { product: { include: { category: true } } }
    });

    res.json({ success: true, data: variant, message: 'Variant updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    console.error('Error updating variant:', error);
    res.status(500).json({ success: false, message: 'Failed to update variant' });
  }
};

// Delete variant
export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.productVariant.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Variant deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    console.error('Error deleting variant:', error);
    res.status(500).json({ success: false, message: 'Failed to delete variant' });
  }
};

// Toggle status
export const toggleVariantStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const variant = await prisma.productVariant.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    const newStatus = variant.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.productVariant.update({
      where: { id: parseInt(id as string) },
      data: { status: newStatus }
    });

    res.json({ success: true, data: updated, message: 'Variant status updated successfully' });
  } catch (error) {
    console.error('Error toggling variant status:', error);
    res.status(500).json({ success: false, message: 'Failed to update variant status' });
  }
};
