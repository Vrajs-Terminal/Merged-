import express from "express";
import {
    getExpenseCategories,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory
} from "../controllers/expenseCategoryController";

const router = express.Router();

router.get("/", getExpenseCategories);
router.post("/", createExpenseCategory);
router.put("/:id", updateExpenseCategory);
router.delete("/:id", deleteExpenseCategory);

export default router;
