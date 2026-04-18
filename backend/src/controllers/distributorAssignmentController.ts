import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getDistributorAssignments = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.distributorAssignment.findMany({
      include: {
        employee: true,
        distributor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const grouped = rows.reduce((acc: any[], row) => {
      const existing = acc.find(item => item.employee?.id === row.employeeId);
      if (existing) {
        existing.distributors.push(row.distributor);
        return acc;
      }

      acc.push({
        id: row.employeeId,
        employee: row.employee,
        distributors: [row.distributor],
        createdAt: row.createdAt,
      });
      return acc;
    }, []);

    res.status(200).json(grouped);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createDistributorAssignments = async (req: Request, res: Response) => {
  try {
    const { employeeId, distributorIds } = req.body;
    const employee = await prisma.employee.findUnique({ where: { id: Number(employeeId) } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const ids = Array.isArray(distributorIds) ? distributorIds.map((id: any) => Number(id)).filter(Boolean) : [];
    if (ids.length === 0) {
      return res.status(400).json({ message: "At least one distributor is required" });
    }

    await prisma.distributorAssignment.deleteMany({
      where: { employeeId: Number(employeeId) },
    });

    await prisma.distributorAssignment.createMany({
      data: ids.map((distributorId: number) => ({
        employeeId: Number(employeeId),
        distributorId,
      })),
      skipDuplicates: true,
    });

    const rows = await prisma.distributorAssignment.findMany({
      where: { employeeId: Number(employeeId) },
      include: { employee: true, distributor: true },
    });

    res.status(201).json({
      message: "Distributor assignments saved successfully",
      assignments: rows,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteDistributorAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.distributorAssignment.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteDistributorAssignmentsByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    await prisma.distributorAssignment.deleteMany({
      where: { employeeId: Number(employeeId) },
    });
    res.status(200).json({ message: "Employee assignments deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};