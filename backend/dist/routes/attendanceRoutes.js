"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendanceController_1 = require("../controllers/attendanceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/clock-in", authMiddleware_1.authenticateToken, attendanceController_1.clockIn);
router.post("/clock-out", authMiddleware_1.authenticateToken, attendanceController_1.clockOut);
router.get("/today", authMiddleware_1.authenticateToken, attendanceController_1.getTodayStatus);
router.get("/monthly", authMiddleware_1.authenticateToken, attendanceController_1.getMonthlyAttendance);
exports.default = router;
