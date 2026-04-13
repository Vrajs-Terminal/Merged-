import express from 'express';
import {
  getAllCustomerSubCategories,
  getCustomerSubCategory,
  createCustomerSubCategory,
  updateCustomerSubCategory,
  deleteCustomerSubCategory,
  toggleCustomerSubCategoryStatus
} from '../controllers/customerSubCategoryController';

const router = express.Router();

router.get('/', getAllCustomerSubCategories);
router.get('/:id', getCustomerSubCategory);
router.post('/', createCustomerSubCategory);
router.put('/:id', updateCustomerSubCategory);
router.delete('/:id', deleteCustomerSubCategory);
router.patch('/:id/toggle-status', toggleCustomerSubCategoryStatus);

export default router;
