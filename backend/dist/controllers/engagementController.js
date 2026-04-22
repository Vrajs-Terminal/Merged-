"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingEvents = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getUpcomingEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branch, department, eventType, days = "30" } = req.query;
        const filters = { status: "Active" };
        if (branch && branch !== "All")
            filters.branch = branch;
        if (department && department !== "All")
            filters.department = department;
        const employees = yield prismaClient_1.default.employee.findMany({
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
        const upcomingEvents = [];
        employees.forEach((emp) => {
            const addEvent = (date, type) => {
                if (!date)
                    return;
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
    }
    catch (error) {
        console.error("Error fetching upcoming events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getUpcomingEvents = getUpcomingEvents;
