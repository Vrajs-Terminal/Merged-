import type { Request, Response } from "express";
import getPrismaClient from "../config/db";

const prisma = getPrismaClient();

// ============================================
// Nomination Type (Master Setup)
// ============================================

export const createNominationType = async (req: Request, res: Response) => {
  try {
    const { name, description, allowMultiple } = req.body;
    const type = await prisma.nominationType.create({
      data: { name, description, allowMultiple },
    });
    res.status(201).json(type);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating nomination type", error: error.message });
  }
};

export const getNominationTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.nominationType.findMany();
    res.status(200).json(types);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching nomination types", error: error.message });
  }
};

export const updateNominationType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, allowMultiple } = req.body;
    const type = await prisma.nominationType.update({
      where: { id: Number(id) },
      data: { name, description, allowMultiple },
    });
    res.status(200).json(type);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating nomination type", error: error.message });
  }
};

export const deleteNominationType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.nominationType.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting nomination type", error: error.message });
  }
};

// ============================================
// Manage Employees Nominee
// ============================================

export const addEmployeeNominee = async (req: Request, res: Response) => {
  try {
    const { employeeId, nominationTypeId, nomineeName, relation, dob, aadharNumber, mobileNo, email, address, nomineePercentage } = req.body;

    // Check type multiple flag and percentages
    const nomType = await prisma.nominationType.findUnique({ where: { id: Number(nominationTypeId) } });
    if (!nomType) {
       return res.status(404).json({ message: "Nomination type not found" });
    }

    const existingTypeNominees = await prisma.employeeNominee.findMany({
      where: { employeeId: Number(employeeId), nominationTypeId: Number(nominationTypeId) }
    });

    if (!nomType.allowMultiple && existingTypeNominees.length > 0) {
      return res.status(400).json({ message: "This nomination type does not allow multiple nominees." });
    }

    let totalPercentage = existingTypeNominees.reduce((acc: number, curr: any) => acc + curr.nomineePercentage, 0);
    if (totalPercentage + Number(nomineePercentage) > 100) {
       return res.status(400).json({ message: "Total nominee percentage cannot exceed 100%." });
    }

    // Aadhar duplicate check per employee (globally across nominees if required by HR, but practically per person is fine, though we'll check globally because rule says so)
    const existingAadhar = await prisma.employeeNominee.findFirst({ where: { aadharNumber } });
    if (existingAadhar) {
       return res.status(400).json({ message: "Aadhar number already exists for another nominee." });
    }

    const nominee = await prisma.employeeNominee.create({
      data: {
        employeeId: Number(employeeId),
        nominationTypeId: Number(nominationTypeId),
        nomineeName,
        relation,
        dob: dob ? new Date(dob) : null,
        aadharNumber,
        mobileNo,
        email,
        address,
        nomineePercentage: Number(nomineePercentage),
      },
    });

    res.status(201).json(nominee);
  } catch (error: any) {
    res.status(500).json({ message: "Error adding nominee", error: error.message });
  }
};

export const getEmployeeNominees = async (req: Request, res: Response) => {
  try {
    const nominees = await prisma.employeeNominee.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeId: true }
        },
        nominationType: true
      }
    });
    res.status(200).json(nominees);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching nominees", error: error.message });
  }
};

export const bulkUploadNominees = async (req: Request, res: Response) => {
  try {
    const { nominees } = req.body; // Expects an array of nominees parsed from Excel
    const errors = [];
    const successCount = 0;

    // Ideally, process inside a transaction or handle one by one to give detailed error rows
    for (const data of nominees) {
      try {
        const employee = await prisma.employee.findUnique({ where: { employeeId: data.employeeId } });
        if (!employee) throw new Error("Employee not found");
        
        const type = await prisma.nominationType.findFirst({ where: { name: data.nominationType } });
        if (!type) throw new Error("Nomination Type not found");

        await prisma.employeeNominee.create({
          data: {
            employeeId: employee.id,
            nominationTypeId: type.id,
            nomineeName: data.nomineeName,
            relation: data.relation,
            aadharNumber: data.aadharNumber,
            mobileNo: data.mobileNo,
            nomineePercentage: Number(data.percentage),
          }
        });
      } catch (e: any) {
         errors.push({ row: data, error: e.message });
      }
    }

    res.status(200).json({ message: "Bulk upload processed", errors });
  } catch (error: any) {
    res.status(500).json({ message: "Error processing bulk upload", error: error.message });
  }
};

export const deleteEmployeeNominee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.employeeNominee.delete({
      where: { id: Number(id) }
    });
    res.status(200).json({ message: "Nominee deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting nominee", error: error.message });
  }
};
