import express from 'express';
import { getProductStocks, createOrUpdateStock, getStockLogs, createStockLog } from '../controllers/productStockController';

const router = express.Router();

// Product Stocks API
router.get('/', getProductStocks);
router.post('/upsert', createOrUpdateStock);

// Stock Logs API
router.get('/logs', getStockLogs);
router.post('/logs', createStockLog);

export default router;
