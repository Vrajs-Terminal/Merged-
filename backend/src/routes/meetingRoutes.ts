import { Router } from 'express';
import * as meetingController from '../controllers/meetingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication to all meeting routes
router.use(authenticateToken);

router.post('/schedule', meetingController.createMeeting);
router.get('/list', meetingController.getMeetings);
router.get('/details/:id', meetingController.getMeetingById);
router.patch('/status/:id', meetingController.updateMeetingStatus);
router.post('/mark-attendance/:meetingId/:userId', meetingController.markAttendance);
router.post('/mom', meetingController.saveMOM);
router.get('/action-items', meetingController.getActionItems);
router.patch('/action-item/:id', meetingController.updateActionItem);
router.get('/reports', meetingController.getMeetingReports);
router.get('/settings', meetingController.getMeetingSettings);
router.post('/settings', meetingController.updateMeetingSettings);

export default router;
