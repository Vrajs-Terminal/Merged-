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
exports.deleteOrder = exports.updateOrderStatus = exports.getOrders = exports.createOrder = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderNo, employeeId, orderBy, retailer, distributor, city, area, amount, quantity, unit, status, location, outOfRange, outOfRangeReason, country, state, product } = req.body;
        const newOrder = yield prisma.order.create({
            data: {
                orderNo, employeeId, orderBy, retailer, distributor, city, area, amount: Number(amount), quantity: Number(quantity), unit,
                status: status || 'Pending', location, outOfRange: outOfRange || 'No', outOfRangeReason, country, state, product
            }
        });
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
});
exports.createOrder = createOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { employee: true }
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});
exports.getOrders = getOrders;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedOrder = yield prisma.order.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.status(200).json({ message: 'Order status updated', order: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.order.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete order', error: error.message });
    }
});
exports.deleteOrder = deleteOrder;
