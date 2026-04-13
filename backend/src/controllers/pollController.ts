import type { Request, Response } from "express";
import getPrismaClient from "../config/db";

const prisma = getPrismaClient();

export const getAllPolls = async (req: Request, res: Response) => {
  try {
    const polls = await (prisma as any).poll.findMany({
      include: { options: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(polls);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPoll = async (req: Request, res: Response) => {
  try {
    const { question, description, startDate, endDate, targetAudience, isMultipleChoice, isAnonymous, options } = req.body;
    
    // Auto status based on date
    const start = new Date(startDate);
    const now = new Date();
    let status = "Active";
    if (start > now) status = "Upcoming";

    const poll = await (prisma as any).poll.create({
      data: {
        question,
        description,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        targetAudience,
        isMultipleChoice,
        isAnonymous,
        status,
        options: {
          create: options.map((opt: string) => ({ optionText: opt }))
        }
      },
      include: { options: true }
    });
    res.status(201).json(poll);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).poll.delete({ where: { id: parseInt(id as string) } });
    res.json({ message: "Poll deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const votePoll = async (req: Request, res: Response) => {
  try {
    const { optionId } = req.body;
    const option = await (prisma as any).pollOption.update({
      where: { id: parseInt(optionId as string) },
      data: { votes: { increment: 1 } }
    });
    res.json(option);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
