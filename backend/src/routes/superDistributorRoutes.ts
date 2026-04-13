import express from 'express';
import {
  getAllSuperDistributors,
  getSuperDistributor,
  createSuperDistributor,
  updateSuperDistributor,
  deleteSuperDistributor,
  toggleSuperDistributorStatus
} from '../controllers/superDistributorController';

const router = express.Router();

router.get('/', getAllSuperDistributors);
router.get('/:id', getSuperDistributor);
router.post('/', createSuperDistributor);
router.put('/:id', updateSuperDistributor);
router.delete('/:id', deleteSuperDistributor);
router.patch('/:id/toggle-status', toggleSuperDistributorStatus);

export default router;
