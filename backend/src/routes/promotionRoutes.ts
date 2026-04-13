import express from "express";
import { getPromotions, createPromotion } from "../controllers/promotionController";

const router = express.Router();

router.get("/", getPromotions);
router.post("/", createPromotion);

export default router;
