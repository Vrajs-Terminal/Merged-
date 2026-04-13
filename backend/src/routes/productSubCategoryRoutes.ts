import express from 'express';
import {
  getAllSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategoryStatus
} from '../controllers/productSubCategoryController';

const router = express.Router();

router.get('/', getAllSubCategories);
router.get('/:id', getSubCategory);
router.post('/', createSubCategory);
router.put('/:id', updateSubCategory);
router.delete('/:id', deleteSubCategory);
router.patch('/:id/toggle-status', toggleSubCategoryStatus);

export default router;
