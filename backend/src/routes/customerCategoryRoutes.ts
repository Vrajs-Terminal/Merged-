import express from 'express';
import {
  getAllCustomerCategories,
  getCustomerCategory,
  createCustomerCategory,
  updateCustomerCategory,
  deleteCustomerCategory,
  toggleCustomerCategoryStatus
} from '../controllers/customerCategoryController';

const router = express.Router();

router.get('/', getAllCustomerCategories);
router.get('/:id', getCustomerCategory);
router.post('/', createCustomerCategory);
router.put('/:id', updateCustomerCategory);
router.delete('/:id', deleteCustomerCategory);
router.patch('/:id/toggle-status', toggleCustomerCategoryStatus);

export default router;
