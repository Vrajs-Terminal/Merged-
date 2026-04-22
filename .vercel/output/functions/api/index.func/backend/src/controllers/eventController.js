"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsReport = exports.rsvpEvent = exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.getEvents = exports.createEvent = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const createEvent = async (req, res) => {
    try {
        const { eventName, eventType, startDate, endDate, startTime, endTime, locationType, location, branchIds, departmentIds, employeeIds, description, sendNotification, allowRSVP } = req.body;
        const event = await prismaClient_1.default.event.create({
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
                    connect: branchIds.map((id) => ({ id: parseInt(id) }))
                } : undefined,
                departments: departmentIds ? {
                    connect: departmentIds.map((id) => ({ id: parseInt(id) }))
                } : undefined,
                employees: employeeIds ? {
                    connect: employeeIds.map((id) => ({ id: parseInt(id) }))
                } : undefined
            }
        });
        res.status(201).json(event);
    }
    catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createEvent = createEvent;
const getEvents = async (req, res) => {
    try {
        const { startDate, endDate, eventType, branchId, departmentId } = req.query;
        const where = {};
        if (eventType && eventType !== "All")
            where.eventType = eventType;
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
        const events = await prismaClient_1.default.event.findMany({
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
    }
    catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getEvents = getEvents;
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await prismaClient_1.default.event.findUnique({
            where: { id: parseInt(id) },
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
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        res.status(200).json(event);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getEventById = getEventById;
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { eventName, eventType, startDate, endDate, startTime, endTime, locationType, location, branchIds, departmentIds, employeeIds, description, status, sendNotification, allowRSVP } = req.body;
        const event = await prismaClient_1.default.event.update({
            where: { id: parseInt(id) },
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
                    set: branchIds.map((id) => ({ id: parseInt(id) }))
                } : undefined,
                departments: departmentIds ? {
                    set: departmentIds.map((id) => ({ id: parseInt(id) }))
                } : undefined,
                employees: employeeIds ? {
                    set: employeeIds.map((id) => ({ id: parseInt(id) }))
                } : undefined
            }
        });
        res.status(200).json(event);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.event.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Event deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.deleteEvent = deleteEvent;
const rsvpEvent = async (req, res) => {
    try {
        const { eventId, employeeId, status, remarks } = req.body;
        const rsvp = await prismaClient_1.default.eventRSVP.upsert({
            where: {
                eventId_employeeId: {
                    eventId: parseInt(eventId),
                    employeeId: parseInt(employeeId)
                }
            },
            update: { status, remarks, updatedAt: new Date() },
            create: {
                eventId: parseInt(eventId),
                employeeId: parseInt(employeeId),
                status,
                remarks
            }
        });
        res.status(200).json(rsvp);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.rsvpEvent = rsvpEvent;
const getEventsReport = async (req, res) => {
    try {
        const { startDate, endDate, eventType, branchId, departmentId } = req.query;
        const where = {};
        if (eventType && eventType !== "All")
            where.eventType = eventType;
        if (startDate && endDate) {
            where.startDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const events = await prismaClient_1.default.event.findMany({
            where,
            include: {
                rsvps: true,
                branches: true,
                departments: true,
                employees: { select: { id: true } }
            }
        });
        const report = events.map((event) => {
            var _a, _b, _c;
            const totalInvited = ((_a = event.employees) === null || _a === void 0 ? void 0 : _a.length) || 0;
            const attended = ((_b = event.rsvps) === null || _b === void 0 ? void 0 : _b.filter((r) => r.status === 'Going').length) || 0;
            const notAttended = ((_c = event.rsvps) === null || _c === void 0 ? void 0 : _c.filter((r) => r.status === 'Not Going').length) || 0;
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getEventsReport = getEventsReport;
//# sourceMappingURL=eventController.js.map