import express from 'express';
import { createOrder, getOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
