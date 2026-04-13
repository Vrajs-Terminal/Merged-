import express from 'express';
import {
  getAllDistributors,
  getDistributor,
  createDistributor,
  updateDistributor,
  deleteDistributor,
  toggleDistributorStatus
} from '../controllers/distributorController';

const router = express.Router();

router.get('/', getAllDistributors);
router.get('/:id', getDistributor);
router.post('/', createDistributor);
router.put('/:id', updateDistributor);
router.delete('/:id', deleteDistributor);
router.patch('/:id/toggle-status', toggleDistributorStatus);

export default router;
