import express from 'express';
import { getDesignations, createDesignation, updateDesignation, bulkTransferDesignation } from '../controllers/designationController';

const router = express.Router();

router.get('/', getDesignations);
router.post('/', createDesignation);
router.put('/:id', updateDesignation);
router.post('/bulk-transfer', bulkTransferDesignation);

export default router;
