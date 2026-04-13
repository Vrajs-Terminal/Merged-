import express from 'express';
import {
  getAllBeatPlans,
  getBeatPlan,
  createBeatPlan,
  updateBeatPlan,
  deleteBeatPlan,
  toggleBeatPlanStatus
} from '../controllers/beatPlanController';

const router = express.Router();

router.get('/', getAllBeatPlans);
router.get('/:id', getBeatPlan);
router.post('/', createBeatPlan);
router.put('/:id', updateBeatPlan);
router.delete('/:id', deleteBeatPlan);
router.patch('/:id/toggle-status', toggleBeatPlanStatus);

export default router;
