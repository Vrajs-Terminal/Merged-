import express from "express";
import {
    getFinances,
    getFinanceById,
    createFinance,
} from "../controllers/financeController";

const router = express.Router();

router.get("/", getFinances);
router.get("/:id", getFinanceById);
router.post("/", createFinance);

export default router;
