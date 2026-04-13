import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const reportItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, itemName, description, date, location, photoUrl, reportedById, contactDetails } = req.body;
    const item = await prisma.lostFoundItem.create({
      data: {
        type, 
        itemName, 
        description, 
        date: new Date(date), 
        location, 
        photoUrl, 
        reportedById: Number(reportedById), 
        contactDetails
      }
    });
    res.status(201).json({ message: `${type} item reported successfully`, item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, limit } = req.query;
    const items = await prisma.lostFoundItem.findMany({
      where: {
        ...(type && { type: String(type) }),
        ...(status && { status: String(status) })
      },
      include: {
        reportedBy: {
          select: { firstName: true, lastName: true, employeeId: true, branch: true }
        },
        claims: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? Number(limit) : undefined
    });
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateItemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const item = await prisma.lostFoundItem.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.status(200).json({ message: "Status updated", item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.lostFoundItem.delete({
      where: { id: Number(id) }
    });
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const claimItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId, claimedById, proofDescription } = req.body;
    const claim = await prisma.itemClaim.create({
      data: {
        itemId: Number(itemId),
        claimedById: Number(claimedById),
        proofDescription
      }
    });
    res.status(201).json({ message: "Claim submitted successfully", claim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    const claims = await prisma.itemClaim.findMany({
      include: {
        item: true,
        claimedBy: {
          select: { firstName: true, lastName: true, employeeId: true }
        },
        approvedBy: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(claims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const verifyClaim = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, approvedById } = req.body; // status: Approved / Rejected
    
    const claim = await prisma.itemClaim.update({
      where: { id: Number(id) },
      data: { 
        status, 
        approvedById: approvedById ? Number(approvedById) : undefined 
      }
    });

    if (status === 'Approved') {
      await prisma.lostFoundItem.update({
        where: { id: claim.itemId },
        data: { status: 'Returned' }
      });
    }

    res.status(200).json({ message: `Claim ${status}`, claim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
