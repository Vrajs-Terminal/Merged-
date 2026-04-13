import { Router } from 'express';
import {
    getTemplates, createTemplate, updateTemplate, deleteTemplate,
    assignTemplate, getAssignments, deleteAssignment
} from '../controllers/expenseTemplateController';

const router = Router();

router.get('/', getTemplates);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.get('/assignments', getAssignments);
router.post('/assign', assignTemplate);
router.delete('/assignments/:id', deleteAssignment);

export default router;
