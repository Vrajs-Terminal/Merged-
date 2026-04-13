import express from 'express';
import { getDepartments, createDepartment, updateDepartment, bulkTransferDepartment } from '../controllers/departmentController';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.post('/bulk-transfer', bulkTransferDepartment);

export default router;
