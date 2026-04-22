"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productStockController_1 = require("../controllers/productStockController");
const router = express_1.default.Router();
// Product Stocks API
router.get('/', productStockController_1.getProductStocks);
router.post('/upsert', productStockController_1.createOrUpdateStock);
// Stock Logs API
router.get('/logs', productStockController_1.getStockLogs);
router.post('/logs', productStockController_1.createStockLog);
exports.default = router;
