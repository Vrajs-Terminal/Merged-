import express from "express";
import {
    getExpenseSettings,
    createExpenseSetting,
    updateExpenseSetting,
    deleteExpenseSetting
} from "../controllers/expenseSettingController";

const router = express.Router();

router.get("/", getExpenseSettings);
router.post("/", createExpenseSetting);
router.put("/:id", updateExpenseSetting);
router.delete("/:id", deleteExpenseSetting);

export default router;
