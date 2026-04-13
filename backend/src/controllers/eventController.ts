import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const {
            eventName, eventType, startDate, endDate, startTime, endTime,
            locationType, location, branchIds, departmentIds, employeeIds,
            description, sendNotification, allowRSVP
        } = req.body;

        const event = await prisma.event.create({
            data: {
                eventName,
                eventType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                startTime,
                endTime,
                locationType,
                location,
                description,
                sendNotification: sendNotification === 'Yes' || sendNotification === true,
                allowRSVP: allowRSVP === 'Yes' || allowRSVP === true,
                branches: branchIds ? {
                    connect: branchIds.map((id: any) => ({ id: parseInt(id as string) }))
                } : undefined,
                departments: departmentIds ? {
                    connect: departmentIds.map((id: any) => ({ id: parseInt(id as string) }))
                } : undefined,
                employees: employeeIds ? {
                    connect: employeeIds.map((id: any) => ({ id: parseInt(id as string) }))
                } : undefined
            }
        });

        res.status(201).json(event);
    } catch (error: any) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getEvents = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, eventType, branchId, departmentId } = req.query as any;

        const where: any = {};
        if (eventType && eventType !== "All") where.eventType = eventType;
        if (startDate && endDate) {
            where.startDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (branchId && branchId !== "All") {
            where.branches = { some: { id: parseInt(branchId) } };
        }
        if (departmentId && departmentId !== "All") {
            where.departments = { some: { id: parseInt(departmentId) } };
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                branches: true,
                departments: true,
                employees: {
                    select: { id: true, firstName: true, lastName: true }
                },
                rsvps: true
            },
            orderBy: { startDate: 'asc' }
        });

        res.status(200).json(events);
    } catch (error: any) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id as string) },
            include: {
                branches: true,
                departments: true,
                employees: true,
                rsvps: {
                    include: {
                        employee: {
                            select: { firstName: true, lastName: true, designation: true }
                        }
                    }
                }
            }
        });

        if (!event) return res.status(404).json({ message: "Event not found" });
        res.status(200).json(event);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            eventName, eventType, startDate, endDate, startTime, endTime,
            locationType, location, branchIds, departmentIds, employeeIds,
            description, status, sendNotification, allowRSVP
        } = req.body;

        const event = await prisma.event.update({
            where: { id: parseInt(id as string) },
            data: {
                eventName,
                eventType,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                startTime,
                endTime,
                locationType,
                location,
                description,
                status,
                sendNotification: sendNotification === 'Yes' || sendNotification === true,
                allowRSVP: allowRSVP === 'Yes' || allowRSVP === true,
                branches: branchIds ? {
                    set: branchIds.map((id: any) => ({ id: parseInt(id as string) }))
                } : undefined,
                departments: departmentIds ? {
                    set: departmentIds.map((id: any) => ({ id: parseInt(id as string) }))
                } : undefined,
                employees: employeeIds ? {
                    set: employeeIds.map((id: any) => ({ id: parseInt(id as string) }))
                } : undefined
            }
        });

        res.status(200).json(event);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.event.delete({ where: { id: parseInt(id as string) } });
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const rsvpEvent = async (req: Request, res: Response) => {
    try {
        const { eventId, employeeId, status, remarks } = req.body;
        
        const rsvp = await prisma.eventRSVP.upsert({
            where: {
                eventId_employeeId: {
                    eventId: parseInt(eventId as string),
                    employeeId: parseInt(employeeId as string)
                }
            },
            update: { status, remarks, updatedAt: new Date() },
            create: {
                eventId: parseInt(eventId as string),
                employeeId: parseInt(employeeId as string),
                status,
                remarks
            }
        });

        res.status(200).json(rsvp);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getEventsReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, eventType, branchId, departmentId } = req.query as any;

        const where: any = {};
        if (eventType && eventType !== "All") where.eventType = eventType;
        if (startDate && endDate) {
            where.startDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                rsvps: true,
                branches: true,
                departments: true,
                employees: { select: { id: true } }
            }
        });

        const report = events.map((event: any) => {
            const totalInvited = event.employees?.length || 0;
            const attended = event.rsvps?.filter((r: any) => r.status === 'Going').length || 0;
            const notAttended = event.rsvps?.filter((r: any) => r.status === 'Not Going').length || 0;
            
            return {
                eventName: event.eventName,
                type: event.eventType,
                date: event.startDate,
                location: event.location,
                totalInvited,
                attended,
                notAttended,
                participationRate: totalInvited > 0 ? (attended / totalInvited) * 100 : 0
            };
        });

        res.status(200).json(report);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
