import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export const surveyController = {
  // Get all surveys
  getAll: async (req: Request, res: Response) => {
    try {
      const { status, search } = req.query;
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
        ];
      }

      const surveys = await prisma.survey.findMany({
        where,
        include: {
          _count: {
            select: { 
              questions: true,
              responses: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(surveys);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get single survey
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const survey = await prisma.survey.findUnique({
        where: { id: parseInt(id as string) },
        include: {
          questions: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: { responses: true }
          }
        }
      });
      if (!survey) return res.status(404).json({ message: 'Survey not found' });
      res.json(survey);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create survey
  create: async (req: Request, res: Response) => {
    try {
      const { title, description, startDate, endDate, targetAudience, isAnonymous, sendReminder, autoClose, questions } = req.body;
      
      const survey = await prisma.survey.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          targetAudience,
          isAnonymous,
          sendReminder,
          autoClose,
          status: 'Active',
          questions: {
            create: questions?.map((q: any, index: number) => ({
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options,
              isRequired: q.isRequired,
              order: q.order || index
            }))
          }
        },
        include: {
          questions: true
        }
      });
      res.status(201).json(survey);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update survey
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, startDate, endDate, targetAudience, isAnonymous, sendReminder, autoClose, status } = req.body;
      
      const survey = await prisma.survey.update({
        where: { id: parseInt(id as string) },
        data: {
          title,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          targetAudience,
          isAnonymous,
          sendReminder,
          autoClose,
          status
        }
      });
      res.json(survey);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete survey
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.survey.delete({
        where: { id: parseInt(id as string) }
      });
      res.json({ message: 'Survey deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Submit response
  submitResponse: async (req: Request, res: Response) => {
    try {
      const { surveyId, employeeId, answers } = req.body;
      
      const response = await prisma.surveyResponse.create({
        data: {
          surveyId: parseInt(surveyId),
          employeeId: employeeId ? parseInt(employeeId) : null,
          answers: {
            create: answers.map((a: any) => ({
              questionId: parseInt(a.questionId),
              answerText: a.answerText,
              rating: a.rating
            }))
          }
        }
      });
      res.status(201).json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
