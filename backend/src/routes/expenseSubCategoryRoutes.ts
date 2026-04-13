import express from "express";
import {
    getExpenseSubCategories,
    createExpenseSubCategory,
    updateExpenseSubCategory,
    deleteExpenseSubCategory
} from "../controllers/expenseSubCategoryController";

const router = express.Router();

router.get("/", getExpenseSubCategories);
router.post("/", createExpenseSubCategory);
router.put("/:id", updateExpenseSubCategory);
router.delete("/:id", deleteExpenseSubCategory);

export default router;
