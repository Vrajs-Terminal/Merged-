import express from 'express';
import { getUnits, createUnit, updateUnit, deleteUnit, toggleUnitStatus } from '../controllers/unitMeasureController';

const router = express.Router();

router.get('/', getUnits);
router.post('/', createUnit);
router.put('/:id', updateUnit);
router.delete('/:id', deleteUnit);
router.patch('/:id/toggle-status', toggleUnitStatus);

export default router;
