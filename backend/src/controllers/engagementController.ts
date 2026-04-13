import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const getUpcomingEvents = async (req: Request, res: Response) => {
    try {
        const { branch, department, eventType, days = "30" } = req.query as any;

        const filters: any = { status: "Active" };
        if (branch && branch !== "All") filters.branch = branch;
        if (department && department !== "All") filters.department = department;

        const employees = await prisma.employee.findMany({
            where: filters,
            select: {
                id: true,
                employeeId: true,
                firstName: true,
                lastName: true,
                dob: true,
                doj: true,
                weddingAnniversary: true,
                branch: true,
                department: true,
                email: true,
                mobile: true,
            },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + Number(days));

        const upcomingEvents: any[] = [];

        employees.forEach((emp: any) => {
            const addEvent = (date: Date | null, type: string) => {
                if (!date) return;
                
                const eventYear = today.getFullYear();
                let eventDate = new Date(date);
                eventDate.setFullYear(eventYear);

                // If event already passed this year, check next year
                if (eventDate < today) {
                    eventDate.setFullYear(eventYear + 1);
                }

                const diffTime = eventDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays <= Number(days)) {
                    upcomingEvents.push({
                        employeeId: emp.employeeId,
                        name: `${emp.firstName} ${emp.lastName}`,
                        eventType: type,
                        date: eventDate,
                        originalDate: date,
                        daysLeft: diffDays,
                        branch: emp.branch,
                        department: emp.department,
                        email: emp.email,
                        mobile: emp.mobile,
                    });
                }
            };

            if (!eventType || eventType === "All" || eventType === "Birthday") {
                addEvent(emp.dob, "Birthday");
            }
            if (!eventType || eventType === "All" || eventType === "Work Anniversary") {
                addEvent(emp.doj, "Work Anniversary");
            }
            if (!eventType || eventType === "All" || eventType === "Wedding Anniversary") {
                addEvent(emp.weddingAnniversary, "Wedding Anniversary");
            }
        });

        // Sort by days left
        upcomingEvents.sort((a, b) => a.daysLeft - b.daysLeft);

        res.status(200).json(upcomingEvents);
    } catch (error: any) {
        console.error("Error fetching upcoming events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
