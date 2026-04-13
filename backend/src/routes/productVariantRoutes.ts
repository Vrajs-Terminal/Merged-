import express from 'express';
import {
  getAllVariants,
  getVariant,
  createVariant,
  updateVariant,
  deleteVariant,
  toggleVariantStatus
} from '../controllers/productVariantController';

const router = express.Router();

router.get('/', getAllVariants);
router.get('/:id', getVariant);
router.post('/', createVariant);
router.put('/:id', updateVariant);
router.delete('/:id', deleteVariant);
router.patch('/:id/toggle-status', toggleVariantStatus);

export default router;
