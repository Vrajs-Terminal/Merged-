import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET Common Visitors Report (History)
router.get('/common', async (req, res) => {
    try {
        const { start_date, end_date, search, status } = req.query;
        const where: any = {};
        if (status && status !== 'All') where.status = String(status);
        if (start_date || end_date) {
            where.in_time = {};
            if (start_date) where.in_time.gte = new Date(String(start_date) + 'T00:00:00Z');
            if (end_date) where.in_time.lte = new Date(String(end_date) + 'T23:59:59Z');
        }
        if (search) {
            where.visitor = {
                OR: [
                    { name: { contains: String(search) } },
                    { mobile: { contains: String(search) } },
                    { company: { contains: String(search) } }
                ]
            };
        }

        const logs = await prisma.visitorLog.findMany({
            where,
            include: {
                visitor: true,
                subType: { select: { name: true } },
                employee: { select: { name: true } }
            },
            orderBy: { in_time: 'desc' }
        });
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET Frequent Visitors Analysis
router.get('/frequent', async (req, res) => {
    try {
        const { min_visits } = req.query;
        const limitCount = Number(min_visits) || 3;

        // Group by visitor_id and count
        const frequents = await prisma.visitorLog.groupBy({
            by: ['visitor_id'],
            _count: {
                _all: true
            },
            where: {
                status: 'Checked-Out'
            },
            having: {
                visitor_id: {
                    _count: {
                        gt: limitCount - 1
                    }
                }
            }
        });

        // Fetch details for those visitors
        const visitorIds = frequents.map(f => f.visitor_id);
        const visitorDetails = await prisma.visitorProfile.findMany({
            where: { id: { in: visitorIds } },
            include: {
                visitorLogs: {
                    orderBy: { in_time: 'desc' },
                    take: 1,
                    include: { subType: { select: { name: true } } }
                }
            }
        });

        const results = visitorDetails.map(v => {
            const groupData = frequents.find(f => f.visitor_id === v.id);
            return {
                ...v,
                visit_count: groupData?._count._all || 0,
                last_visit: v.visitorLogs[0] || null
            };
        });

        // Sort by visit_count descending
        results.sort((a, b) => b.visit_count - a.visit_count);

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
