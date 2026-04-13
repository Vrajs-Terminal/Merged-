import express from 'express';
import { getBranches, createBranch, updateBranch, bulkTransferBranch } from '../controllers/branchController';

const router = express.Router();

router.get('/', getBranches);
router.post('/', createBranch);
router.put('/:id', updateBranch);
router.post('/bulk-transfer', bulkTransferBranch);

export default router;
