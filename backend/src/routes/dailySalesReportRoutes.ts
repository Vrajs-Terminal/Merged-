import express from 'express';
import {
  getDailySalesReport,
  getDailySalesRecord,
  createDailySalesRecord,
  updateDailySalesRecord,
  deleteDailySalesRecord,
  getSummaryByEmployee
} from '../controllers/dailySalesReportController';

const router = express.Router();

router.get('/', getDailySalesReport);
router.get('/summary/employee', getSummaryByEmployee);
router.get('/:id', getDailySalesRecord);
router.post('/', createDailySalesRecord);
router.put('/:id', updateDailySalesRecord);
router.delete('/:id', deleteDailySalesRecord);

export default router;
