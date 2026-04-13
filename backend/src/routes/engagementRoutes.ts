import express from "express";
import { getUpcomingEvents } from "../controllers/engagementController";

const router = express.Router();

router.get("/upcoming", getUpcomingEvents);

export default router;
