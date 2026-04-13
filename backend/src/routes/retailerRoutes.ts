import express from 'express';
import {
  getAllRetailers,
  getRetailer,
  createRetailer,
  updateRetailer,
  deleteRetailer,
  toggleRetailerStatus
} from '../controllers/retailerController';

const router = express.Router();

router.get('/', getAllRetailers);
router.get('/:id', getRetailer);
router.post('/', createRetailer);
router.put('/:id', updateRetailer);
router.delete('/:id', deleteRetailer);
router.patch('/:id/toggle-status', toggleRetailerStatus);

export default router;
