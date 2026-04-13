import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// Get all job locations
export const getAllJobLocations = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 25;
    const skip = (pageNum - 1) * limitNum;

    const [jobLocations, total] = await Promise.all([
      prisma.jobLocation.findMany({
        skip,
        take: limitNum,
        include: { employee: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.jobLocation.count()
    ]);

    // Parse countries and states
    const jobLocationsWithParsed = jobLocations.map(jl => ({
      ...jl,
      countries: jl.countries ? JSON.parse(jl.countries) : [],
      states: jl.states ? JSON.parse(jl.states) : []
    }));

    res.json({
      success: true,
      data: jobLocationsWithParsed,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching job locations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job locations' });
  }
};

// Get single job location
export const getJobLocation = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const jobLocation = await prisma.jobLocation.findUnique({
      where: { employeeId: parseInt(employeeId as string) },
      include: { employee: true }
    });

    if (!jobLocation) {
      return res.status(404).json({ success: false, message: 'Job location not found' });
    }

    res.json({
      success: true,
      data: {
        ...jobLocation,
        countries: jobLocation.countries ? JSON.parse(jobLocation.countries) : [],
        states: jobLocation.states ? JSON.parse(jobLocation.states) : []
      }
    });
  } catch (error) {
    console.error('Error fetching job location:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job location' });
  }
};

// Create job location
export const createJobLocation = async (req: Request, res: Response) => {
  try {
    const { employeeId, countries = [], states = [] } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required' });
    }

    const jobLocation = await prisma.jobLocation.create({
      data: {
        employeeId: parseInt(employeeId),
        countries: JSON.stringify(countries),
        states: JSON.stringify(states)
      },
      include: { employee: true }
    });

    res.status(201).json({
      success: true,
      data: {
        ...jobLocation,
        countries: countries,
        states: states
      },
      message: 'Job location created successfully'
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Job location already exists for this employee' });
    }
    console.error('Error creating job location:', error);
    res.status(500).json({ success: false, message: 'Failed to create job location' });
  }
};

// Update job location
export const updateJobLocation = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { countries = [], states = [] } = req.body;

    const jobLocation = await prisma.jobLocation.update({
      where: { employeeId: parseInt(employeeId as string) },
      data: {
        countries: JSON.stringify(countries),
        states: JSON.stringify(states)
      },
      include: { employee: true }
    });

    res.json({
      success: true,
      data: {
        ...jobLocation,
        countries: countries,
        states: states
      },
      message: 'Job location updated successfully'
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Job location not found' });
    }
    console.error('Error updating job location:', error);
    res.status(500).json({ success: false, message: 'Failed to update job location' });
  }
};

// Delete job location
export const deleteJobLocation = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    await prisma.jobLocation.delete({
      where: { employeeId: parseInt(employeeId as string) }
    });

    res.json({ success: true, message: 'Job location deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Job location not found' });
    }
    console.error('Error deleting job location:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job location' });
  }
};
