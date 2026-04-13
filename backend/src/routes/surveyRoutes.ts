import { Router } from 'express';
import { surveyController } from '../controllers/surveyController';

const router = Router();

// Survey management routes
router.get('/', surveyController.getAll);
router.get('/:id', surveyController.getById);
router.post('/', surveyController.create);
router.put('/:id', surveyController.update);
router.delete('/:id', surveyController.delete);

// Submission routes
router.post('/submit', surveyController.submitResponse);

export default router;
