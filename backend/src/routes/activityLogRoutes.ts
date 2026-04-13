import express from "express";
import { createActivityLog, getActivityLogs } from "../controllers/activityLogController";

const router = express.Router();

router.get("/", getActivityLogs);
router.post("/", createActivityLog);

export default router;
