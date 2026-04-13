import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get daily sales report
export const getDailySalesReport = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 25,
      employeeId,
      city,
      distributor,
      startDate,
      endDate,
      search
    } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (employeeId) where.employeeId = parseInt(employeeId as string);
    if (city) where.city = { contains: city as string };
    if (distributor) where.distributor = { contains: distributor as string };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (search) {
      where.OR = [
        { employee: { firstName: { contains: search as string } } },
        { employee: { employeeId: { contains: search as string } } }
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.dailySalesAggregate.findMany({
        where,
        skip,
        take: limitNum,
        include: { employee: true },
        orderBy: { date: 'desc' }
      }),
      prisma.dailySalesAggregate.count({ where })
    ]);

    // Calculate summary
    const summary = {
      totalOrders: reports.reduce((sum, r) => sum + r.orderCount, 0),
      totalQuantity: reports.reduce((sum, r) => sum + r.totalQuantity, 0),
      totalSalesAmount: reports.reduce((sum, r) => sum + r.salesAmount, 0)
    };

    res.json({
      success: true,
      data: reports,
      summary,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching daily sales report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch daily sales report' });
  }
};

// Get single daily sales record
export const getDailySalesRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await prisma.dailySalesAggregate.findUnique({
      where: { id: parseInt(id as string) },
      include: { employee: true }
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Daily sales record not found' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error fetching daily sales record:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch daily sales record' });
  }
};

// Create daily sales record
export const createDailySalesRecord = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      orderCount = 0,
      totalQuantity = 0,
      salesAmount = 0,
      distributor,
      city,
      date
    } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({ success: false, message: 'employeeId and date are required' });
    }

    const record = await prisma.dailySalesAggregate.create({
      data: {
        employeeId: parseInt(employeeId),
        orderCount: parseInt(orderCount),
        totalQuantity: parseInt(totalQuantity),
        salesAmount: parseFloat(salesAmount),
        distributor,
        city,
        date: new Date(date)
      },
      include: { employee: true }
    });

    res.status(201).json({ success: true, data: record, message: 'Daily sales record created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Sales record already exists for this employee on this date' });
    }
    console.error('Error creating daily sales record:', error);
    res.status(500).json({ success: false, message: 'Failed to create daily sales record' });
  }
};

// Update daily sales record
export const updateDailySalesRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderCount, totalQuantity, salesAmount, distributor, city } = req.body;

    const record = await prisma.dailySalesAggregate.update({
      where: { id: parseInt(id as string) },
      data: {
        ...(orderCount !== undefined && { orderCount: parseInt(orderCount) }),
        ...(totalQuantity !== undefined && { totalQuantity: parseInt(totalQuantity) }),
        ...(salesAmount !== undefined && { salesAmount: parseFloat(salesAmount) }),
        ...(distributor && { distributor }),
        ...(city && { city })
      },
      include: { employee: true }
    });

    res.json({ success: true, data: record, message: 'Daily sales record updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Daily sales record not found' });
    }
    console.error('Error updating daily sales record:', error);
    res.status(500).json({ success: false, message: 'Failed to update daily sales record' });
  }
};

// Delete daily sales record
export const deleteDailySalesRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.dailySalesAggregate.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ success: true, message: 'Daily sales record deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Daily sales record not found' });
    }
    console.error('Error deleting daily sales record:', error);
    res.status(500).json({ success: false, message: 'Failed to delete daily sales record' });
  }
};

// Get summary by employee
export const getSummaryByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId as string);
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const records = await prisma.dailySalesAggregate.findMany({
      where,
      include: { employee: true }
    });

    const summary = {
      employeeId,
      totalRecords: records.length,
      totalOrders: records.reduce((sum, r) => sum + r.orderCount, 0),
      totalQuantity: records.reduce((sum, r) => sum + r.totalQuantity, 0),
      totalSalesAmount: records.reduce((sum, r) => sum + r.salesAmount, 0),
      averageOrderAmount: records.length > 0
        ? (records.reduce((sum, r) => sum + r.salesAmount, 0) / records.length).toFixed(2)
        : 0
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error calculating summary:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate summary' });
  }
};
