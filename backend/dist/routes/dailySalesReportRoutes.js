"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dailySalesReportController_1 = require("../controllers/dailySalesReportController");
const router = express_1.default.Router();
router.get('/', dailySalesReportController_1.getDailySalesReport);
router.get('/summary/employee', dailySalesReportController_1.getSummaryByEmployee);
router.get('/:id', dailySalesReportController_1.getDailySalesRecord);
router.post('/', dailySalesReportController_1.createDailySalesRecord);
router.put('/:id', dailySalesReportController_1.updateDailySalesRecord);
router.delete('/:id', dailySalesReportController_1.deleteDailySalesRecord);
exports.default = router;
