import express from "express";
import { clockIn, clockOut, getTodayStatus, getMonthlyAttendance } from "../controllers/attendanceController";
import { authenticateToken as authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/clock-in", authenticate, clockIn);
router.post("/clock-out", authenticate, clockOut);
router.get("/today", authenticate, getTodayStatus);
router.get("/monthly", authenticate, getMonthlyAttendance);

export default router;
