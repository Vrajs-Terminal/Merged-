import express from "express";
import { getUpcomingRetirements } from "../controllers/retirementController";

const router = express.Router();

router.get("/", getUpcomingRetirements);

export default router;
