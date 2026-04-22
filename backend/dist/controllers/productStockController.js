"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockLog = exports.getStockLogs = exports.createOrUpdateStock = exports.getProductStocks = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
// Product Stocks
const getProductStocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stocks = yield prisma.productStock.findMany({
            include: { product: true, variant: true, distributor: true },
            orderBy: { id: 'desc' }
        });
        res.json(stocks);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getProductStocks = getProductStocks;
const createOrUpdateStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, variantId, distributorId, availableStocks } = req.body;
        // This acts as an upsert logic
        const existing = yield prisma.productStock.findUnique({
            where: { variantId_distributorId: { variantId, distributorId: distributorId || null } }
        });
        if (existing) {
            const updated = yield prisma.productStock.update({
                where: { id: existing.id },
                data: { availableStocks: Number(availableStocks) }
            });
            res.json(updated);
        }
        else {
            const stock = yield prisma.productStock.create({
                data: { productId, variantId, distributorId: distributorId || null, availableStocks: Number(availableStocks) }
            });
            res.json(stock);
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.createOrUpdateStock = createOrUpdateStock;
// Stock Logs
const getStockLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logs = yield prisma.stockLog.findMany({
            include: { product: true, variant: true, distributor: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getStockLogs = getStockLogs;
const createStockLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, quantity, performBy, orderId, productId, variantId, distributorId, stockDate, stockTime } = req.body;
        const log = yield prisma.stockLog.create({
            data: {
                type, quantity: Number(quantity), performBy, orderId, productId, variantId,
                distributorId: distributorId || null,
                stockDate: stockDate ? new Date(stockDate) : new Date(),
                stockTime
            }
        });
        // Also update stock
        const factor = (type === 'Stock In' || type === 'Return') ? 1 : -1;
        const change = Number(quantity) * factor;
        const existing = yield prisma.productStock.findUnique({
            where: { variantId_distributorId: { variantId, distributorId: distributorId || null } }
        });
        if (existing) {
            yield prisma.productStock.update({
                where: { id: existing.id },
                data: { availableStocks: existing.availableStocks + change }
            });
        }
        else {
            yield prisma.productStock.create({
                data: { productId, variantId, distributorId: distributorId || null, availableStocks: change > 0 ? change : 0 }
            });
        }
        res.json(log);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.createStockLog = createStockLog;
