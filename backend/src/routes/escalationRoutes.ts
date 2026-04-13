import { Router } from 'express';
import { 
    getEscalations, 
    getEscalationById, 
    createEscalation, 
    updateStatus, 
    addReply 
} from '../controllers/escalationController';

const router = Router();

router.get('/', getEscalations);
router.get('/:id', getEscalationById);
router.post('/', createEscalation);
router.put('/:id/status', updateStatus);
router.post('/:id/reply', addReply);

export default router;
