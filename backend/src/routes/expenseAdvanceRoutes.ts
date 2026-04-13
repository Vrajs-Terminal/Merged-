import { Router } from 'express';
import {
    getAdvances, createAdvance, approveAdvance, rejectAdvance, adjustAdvance
} from '../controllers/expenseAdvanceController';

const router = Router();

router.get('/', getAdvances);
router.post('/', createAdvance);
router.put('/:id/approve', approveAdvance);
router.put('/:id/reject', rejectAdvance);
router.put('/:id/adjust', adjustAdvance);

export default router;
