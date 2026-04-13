import express from 'express';
import { 
  reportItem, 
  getItems, 
  updateItemStatus, 
  deleteItem, 
  claimItem, 
  getClaims, 
  verifyClaim 
} from '../controllers/lostAndFoundController';

const router = express.Router();

router.post('/items', reportItem);
router.get('/items', getItems);
router.put('/items/:id', updateItemStatus);
router.delete('/items/:id', deleteItem);

router.post('/claims', claimItem);
router.get('/claims', getClaims);
router.put('/claims/:id', verifyClaim);

export default router;
