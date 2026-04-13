import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const PenaltyController = {
  // Penalty Rules
  createRule: async (req: Request, res: Response) => {
    try {
      const rule = await (prisma as any).penaltyRule.create({
        data: req.body
      });
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getRules: async (req: Request, res: Response) => {
    try {
      const rules = await (prisma as any).penaltyRule.findMany({
        include: { shift: true }
      });
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateRule: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const rule = await (prisma as any).penaltyRule.update({
        where: { id: Number(id) },
        data: req.body
      });
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteRule: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await (prisma as any).penaltyRule.delete({
        where: { id: Number(id) }
      });
      res.json({ message: "Rule deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Penalty Conversions
  createConversion: async (req: Request, res: Response) => {
    try {
      const conversion = await (prisma as any).penaltyConversion.create({
        data: req.body
      });
      res.json(conversion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getConversions: async (req: Request, res: Response) => {
    try {
      const conversions = await (prisma as any).penaltyConversion.findMany({
        include: { leaveType: true }
      });
      res.json(conversions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Penalty Records (Manage / Pending)
  getRecords: async (req: Request, res: Response) => {
    try {
      const { status, employeeId, startDate, endDate, penaltyType } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status;
      if (employeeId) filters.employeeId = Number(employeeId);
      if (startDate && endDate) {
        filters.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }
      if (penaltyType && penaltyType !== "All") filters.penaltyType = penaltyType;

      const records = await (prisma as any).penaltyRecord.findMany({
        where: filters,
        include: {
          employee: {
            select: { firstName: true, lastName: true, employeeId: true, department: true }
          },
          shift: true,
          rule: true
        },
        orderBy: { date: "desc" }
      });
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  approvePenalty: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;
      const record = await (prisma as any).penaltyRecord.update({
        where: { id: Number(id) },
        data: {
          status: "Approved",
          approvedBy: Number(approvedBy),
          approvedAt: new Date()
        }
      });
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  rejectPenalty: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const record = await (prisma as any).penaltyRecord.update({
        where: { id: Number(id) },
        data: {
          status: "Rejected",
          rejectionReason
        }
      });
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteRecord: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await (prisma as any).penaltyRecord.delete({
        where: { id: Number(id) }
      });
      res.json({ message: "Record deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getReport: async (req: Request, res: Response) => {
    try {
      const { employeeId, departmentId, startDate, endDate, penaltyType } = req.query;
      const filters: any = { status: "Approved" };

      if (employeeId) filters.employeeId = Number(employeeId);
      if (startDate && endDate) {
        filters.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }
      if (penaltyType && penaltyType !== "All") filters.penaltyType = penaltyType;
      
      // If department filter is needed, it would be complex with prisma as it's several levels deep, 
      // but usually employee already has department string.
      
      const records = await (prisma as any).penaltyRecord.findMany({
        where: filters,
        include: {
          employee: true
        }
      });

      // Aggregate by employee
      const reportMap: any = {};
      records.forEach((r: any) => {
        const empId = r.employeeId;
        if (!reportMap[empId]) {
          reportMap[empId] = {
            employee: `${r.employee.firstName} ${r.employee.lastName}`,
            department: r.employee.department,
            totalPenalties: 0,
            totalAmountDeducted: 0,
            leaveDeducted: 0
          };
        }
        reportMap[empId].totalPenalties += 1;
        reportMap[empId].totalAmountDeducted += r.amountDeducted || 0;
        reportMap[empId].leaveDeducted += r.leaveDeducted || 0;
      });

      res.json(Object.values(reportMap));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
