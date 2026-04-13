import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET /api/visit-status
// Returns all visits grouped by status, or filterable by date and employee
router.get('/', async (req, res) => {
    try {
        const { date, user_id, branch_id } = req.query;

        const whereClause: any = {};
        
        if (date) {
            whereClause.date = new Date(date as string);
        }
        if (user_id) {
            whereClause.user_id = parseInt(user_id as string);
        }
        if (branch_id) {
            whereClause.user = {
                branch_id: parseInt(branch_id as string)
            };
        }

        const visits = await prisma.visit.findMany({
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

    } catch (error: any) {
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

        const activeEmployees = await prisma.user.findMany({
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch active employees" });
    }
});

export default router;
