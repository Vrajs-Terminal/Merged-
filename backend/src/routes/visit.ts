import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { authenticateToken } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityLogger';

const router = Router();

/**
 * Get Visit Settings
 * Route: GET /api/visits/settings
 */
router.get('/settings', authenticateToken, async (req, res) => {
    try {
        const setting = await prisma.companySetting.findUnique({
            where: { key: 'visit_settings' }
        });

        // Default settings if none exist
        const defaultSettings = {
            enable_module: true,
            allow_creation_by_employees: true,
            mandatory_checkin_checkout: true,
            enable_gps_tracking: true,
            enable_photo_upload: false,
            enable_customer_signature: false,
            visit_approval_required: true,
        };

        if (!setting) {
            return res.json(defaultSettings);
        }

        res.json(setting.value);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch visit settings', details: error.message });
    }
});

/**
 * Update Visit Settings
 * Route: POST /api/visits/settings
 */
router.post('/settings', authenticateToken, async (req, res) => {
    try {
        const adminUser = (req as any).user;
        if (adminUser.role !== 'Admin' && adminUser.role !== 'Super Admin') {
            return res.status(403).json({ error: 'Only admins can update visit settings' });
        }

        const settingsData = req.body;

        const updateData = await prisma.companySetting.upsert({
            where: { key: 'visit_settings' },
            create: { key: 'visit_settings', value: settingsData },
            update: { value: settingsData }
        });

        await logActivity(adminUser.id, 'UPDATED', 'VISIT_SETTINGS', 'Updated Visit Management settings');
        res.json({ message: 'Settings updated successfully', settings: updateData.value });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update visit settings', details: error.message });
    }
});

/**
 * Visit Dashboard Stats
 * Route: GET /api/visits/dashboard
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date, user_id, department_id } = req.query;
        const user = (req as any).user;

        const whereClause: any = {};

        // Date filter
        if (start_date && end_date) {
            whereClause.date = {
                gte: new Date(start_date as string),
                lte: new Date(end_date as string)
            };
        }

        // Role-based filtering
        if (user.role !== 'Admin' && user.role !== 'Super Admin') {
            whereClause.user_id = user.id; // Employees see their own
        } else {
            if (user_id) whereClause.user_id = parseInt(user_id as string);
            if (department_id) {
                whereClause.user = { department_id: parseInt(department_id as string) };
            }
        }

        const stats = await prisma.visit.groupBy({
            by: ['status'],
            where: whereClause,
            _count: { status: true }
        });

        const totalVisits = await prisma.visit.count({ where: whereClause });

        const formattedStats: any = {
            Total: totalVisits,
            Completed: 0,
            Pending: 0,
            Missed: 0,
            Planned: 0
        };

        stats.forEach((s: any) => {
            if (s.status === 'Completed') formattedStats.Completed = s._count.status;
            else if (s.status === 'Pending Approval') formattedStats.Pending = s._count.status;
            else if (s.status === 'Cancelled') formattedStats.Missed = s._count.status;
            else if (s.status === 'Planned') formattedStats.Planned = s._count.status;
            else if (s.status === 'Draft') formattedStats.Planned += s._count.status;
        });

        res.json(formattedStats);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
    }
});

/**
 * Create a new Visit
 * Route: POST /api/visits
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const {
            date, client_name, client_contact, company_name, city, address,
            purpose, priority_level, remarks, status
        } = req.body;

        const visitDateObj = new Date(date);
        visitDateObj.setHours(0, 0, 0, 0);

        const newVisit = await prisma.visit.create({
            data: {
                user_id: user.id,
                date: visitDateObj,
                client_name,
                client_contact,
                company_name,
                city,
                address,
                purpose,
                priority_level: priority_level || 'Medium',
                remarks,
                status: status || 'Draft'
            }
        });

        await logActivity(user.id, 'CREATED', 'VISIT', `Created visit for ${client_name}`);
        res.status(201).json({ message: 'Visit created successfully', visit: newVisit });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create visit', details: error.message });
    }
});

/**
 * List Visits
 * Route: GET /api/visits
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const { date, user_id, status } = req.query;

        const whereClause: any = {};

        if (date) {
            const dateObj = new Date(date as string);
            dateObj.setHours(0, 0, 0, 0);
            whereClause.date = dateObj;
        }

        if (status) whereClause.status = status;

        if (user.role !== 'Admin' && user.role !== 'Super Admin') {
            whereClause.user_id = user.id;
        } else if (user_id) {
            whereClause.user_id = parseInt(user_id as string);
        }

        const visits = await prisma.visit.findMany({
            where: whereClause,
            include: { user: { select: { id: true, name: true, email: true } }, approver: { select: { id: true, name: true } } },
            orderBy: { date: 'desc' } as any,
            take: 200
        });

        res.json(visits);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch visits', details: error.message });
    }
});

/**
 * Update a Visit
 * Route: PUT /api/visits/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const visitId = parseInt(req.params.id as string);

        const visit = await prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit) return res.status(404).json({ error: 'Visit not found' });

        if (user.role !== 'Admin' && user.role !== 'Super Admin' && visit.user_id !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updateData = { ...req.body };
        // Delete unwanted fields to prevent overwriting specific ones directly
        delete updateData.id;
        delete updateData.user_id;

        if (updateData.date) {
            const dateObj = new Date(updateData.date);
            dateObj.setHours(0, 0, 0, 0);
            updateData.date = dateObj;
        }

        const updatedVisit = await prisma.visit.update({
            where: { id: visitId },
            data: updateData
        });

        await logActivity(user.id, 'UPDATED', 'VISIT', `Updated visit #${visitId}`);
        res.json({ message: 'Visit updated successfully', visit: updatedVisit });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update visit', details: error.message });
    }
});

/**
 * Check-In
 * Route: POST /api/visits/:id/check-in
 */
router.post('/:id/check-in', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const visitId = parseInt(req.params.id as string);
        const { latitude, longitude, photo_url } = req.body;

        const visit = await prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit) return res.status(404).json({ error: 'Visit not found' });
        if (visit.user_id !== user.id) return res.status(403).json({ error: 'Access denied. Exclusively for assigned employee.' });

        const updatedVisit = await prisma.visit.update({
            where: { id: visitId },
            data: {
                status: 'Checked-In',
                check_in_time: new Date(),
                check_in_latitude: latitude,
                check_in_longitude: longitude,
                check_in_photo_url: photo_url
            }
        });

        await logActivity(user.id, 'UPDATED', 'VISIT_CHECKIN', `Checked in for visit #${visitId}`);
        res.json({ message: 'Checked-in successfully', visit: updatedVisit });
    } catch (error: any) {
        res.status(500).json({ error: 'Check-in failed', details: error.message });
    }
});

/**
 * Check-Out
 * Route: POST /api/visits/:id/check-out
 */
router.post('/:id/check-out', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const visitId = parseInt(req.params.id as string);
        const { latitude, longitude, work_summary, next_follow_up_date, document_url, customer_signature_url } = req.body;

        const visit = await prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit) return res.status(404).json({ error: 'Visit not found' });
        if (visit.user_id !== user.id) return res.status(403).json({ error: 'Access denied' });

        // Load Approval Settings
        const setting = await prisma.companySetting.findUnique({ where: { key: 'visit_settings' } });
        const isApprovalRequired = setting?.value ? (setting.value as any).visit_approval_required : true;

        const updatedStatus = isApprovalRequired ? 'Pending Approval' : 'Completed';

        const updatedVisit = await prisma.visit.update({
            where: { id: visitId },
            data: {
                status: updatedStatus,
                check_out_time: new Date(),
                check_out_latitude: latitude,
                check_out_longitude: longitude,
                work_summary,
                next_follow_up_date: next_follow_up_date ? new Date(next_follow_up_date) : null,
                document_url,
                customer_signature_url
            }
        });

        await logActivity(user.id, 'UPDATED', 'VISIT_CHECKOUT', `Checked out from visit #${visitId}`);
        res.json({ message: 'Checked-out successfully', visit: updatedVisit });
    } catch (error: any) {
        res.status(500).json({ error: 'Check-out failed', details: error.message });
    }
});

/**
 * Approve / Reject Visit
 * Route: POST /api/visits/:id/approval
 */
router.post('/:id/approval', authenticateToken, async (req, res) => {
    try {
        const user = (req as any).user;
        const visitId = parseInt(req.params.id as string);
        const { approval_status, approval_comments } = req.body; // 'Approved', 'Rejected', 'Resubmit'

        if (user.role !== 'Admin' && user.role !== 'Super Admin' && user.role !== 'Manager') {
            return res.status(403).json({ error: 'Only Managers and Admins can approve visits' });
        }

        const visit = await prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit) return res.status(404).json({ error: 'Visit not found' });

        let finalStatus = visit.status;
        if (approval_status === 'Approved') finalStatus = 'Completed';
        else if (approval_status === 'Rejected') finalStatus = 'Cancelled';
        else if (approval_status === 'Resubmit') finalStatus = 'Planned';

        const updatedVisit = await prisma.visit.update({
            where: { id: visitId },
            data: {
                status: finalStatus,
                approval_status,
                approval_comments,
                approver_id: user.id
            }
        });

        await logActivity(user.id, 'UPDATED', 'VISIT_APPROVAL', `${approval_status} visit #${visitId}`);
        res.json({ message: `Visit ${approval_status}`, visit: updatedVisit });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to process approval', details: error.message });
    }
});

export default router;
