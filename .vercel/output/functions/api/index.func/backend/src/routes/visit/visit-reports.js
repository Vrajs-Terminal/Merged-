"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET /api/visit-reports
// Master query endpoint for Analytics
router.get('/', async (req, res) => {
    try {
        const { employee_id, country, state, city, area, date_from, date_to, status } = req.query;
        const where = {};
        // 1. Employee Filter
        if (employee_id)
            where.user_id = parseInt(employee_id);
        // 2. Status Filter
        if (status)
            where.status = status;
        // 3. Location Filters
        if (country)
            where.country = country;
        if (state)
            where.state = state;
        if (city)
            where.city = city;
        if (area)
            where.area = area;
        // 4. Date Range Filter
        if (date_from || date_to) {
            where.date = {};
            if (date_from)
                where.date.gte = new Date(date_from);
            if (date_to)
                where.date.lte = new Date(date_to);
        }
        const visits = await prismaClient_1.default.visit.findMany({
            where,
            include: {
                user: { select: { name: true, employee_level_id: true, department: { select: { name: true } } } },
                approver: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });
        // Generate Productivity Metadata Server-side for the Front-End Productivity Report
        // Calculate total time spent per employee and visit completion ratios
        let total_planned_count = 0;
        let total_completed_count = 0;
        let total_time_spent_ms = 0;
        visits.forEach(v => {
            if (v.status === 'Planned')
                total_planned_count++;
            if (v.status === 'Completed' || v.status === 'Pending Approval')
                total_completed_count++;
            if (v.check_in_time && v.check_out_time) {
                const checkIn = new Date(v.check_in_time).getTime();
                const checkOut = new Date(v.check_out_time).getTime();
                if (checkOut > checkIn) {
                    total_time_spent_ms += (checkOut - checkIn);
                }
            }
        });
        res.json({
            data: visits,
            productivity: {
                total_visits: visits.length,
                planned_visits: total_planned_count,
                completed_visits: total_completed_count,
                completion_rate: visits.length > 0 ? (total_completed_count / visits.length) * 100 : 0,
                total_time_spent_minutes: Math.round(total_time_spent_ms / 60000)
            }
        });
    }
    catch (error) {
        console.error("Visit Reports Fetch Error:", error);
        res.status(500).json({ error: "Failed to generate visit reports.", details: error.message });
    }
});
// GET /api/visit-reports/filter-options
// Provides dropdown values for the Smart Filters based on existing static and dynamic data
router.get('/filter-options', async (req, res) => {
    try {
        const [users, locations] = await Promise.all([
            prismaClient_1.default.user.findMany({
                where: { role: { not: 'Superadmin' } },
                select: { id: true, name: true, email: true }
            }),
            prismaClient_1.default.visit.findMany({
                select: { country: true, state: true, city: true, area: true }
            })
        ]);
        // Deduplicate geographic arrays
        const countries = [...new Set(locations.map(l => l.country).filter(Boolean))];
        const states = [...new Set(locations.map(l => l.state).filter(Boolean))];
        const cities = [...new Set(locations.map(l => l.city).filter(Boolean))];
        const areas = [...new Set(locations.map(l => l.area).filter(Boolean))];
        res.json({
            employees: users,
            countries,
            states,
            cities,
            areas
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to load filter options" });
    }
});
exports.default = router;
//# sourceMappingURL=visit-reports.js.map