import { Router } from 'express';
import {
    getEntries, createEntry, approveEntry, rejectEntry,
    markPaid, bulkMarkPaid, getGroupWise, getDayWise
} from '../controllers/expenseEntryController';

const router = Router();

router.get('/', getEntries);
router.post('/', createEntry);
router.put('/:id/approve', approveEntry);
router.put('/:id/reject', rejectEntry);
router.put('/:id/pay', markPaid);
router.put('/bulk/pay', bulkMarkPaid);
router.get('/analytics/group-wise', getGroupWise);
router.get('/analytics/day-wise', getDayWise);

export default router;
