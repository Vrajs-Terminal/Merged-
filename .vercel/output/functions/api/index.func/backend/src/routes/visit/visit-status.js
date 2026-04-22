"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET /api/visit-status
// Returns all visits grouped by status, or filterable by date and employee
router.get('/', async (req, res) => {
    try {
        const { date, user_id, branch_id } = req.query;
        const whereClause = {};
        if (date) {
            whereClause.date = new Date(date);
        }
        if (user_id) {
            whereClause.user_id = parseInt(user_id);
        }
        if (branch_id) {
            whereClause.user = {
                branch_id: parseInt(branch_id)
            };
        }
        const visits = await prismaClient_1.default.visit.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        department: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Group visits by their status for the Kanban board UI
        const grouped = {
            'Planned': visits.filter(v => v.status === 'Planned'),
            'Checked-In': visits.filter(v => v.status === 'Checked-In'),
            'Completed': visits.filter(v => v.status === 'Completed'),
            'Pending Approval': visits.filter(v => v.status === 'Pending Approval'),
            'Cancelled': visits.filter(v => v.status === 'Cancelled')
        };
        res.json({
            raw: visits,
            grouped: grouped,
            summary: {
                total: visits.length,
                planned: grouped['Planned'].length,
                active: grouped['Checked-In'].length,
                completed: grouped['Completed'].length,
                needs_approval: grouped['Pending Approval'].length,
                cancelled: grouped['Cancelled'].length
            }
        });
    }
    catch (error) {
        console.error("Visit Status API Error: ", error);
        res.status(500).json({ error: "Failed to fetch visit statuses.", details: error.message });
    }
});
// GET /api/visit-status/employees
// Get active employees who have visits scheduled today for the filter sidebar
router.get('/employees', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeEmployees = await prismaClient_1.default.user.findMany({
            where: {
                visits: {
                    some: {
                        date: {
                            gte: today
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                department: { select: { name: true } }
            }
        });
        res.json(activeEmployees);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch active employees" });
    }
});
exports.default = router;
//# sourceMappingURL=visit-status.js.map