"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenseSubCategoryController_1 = require("../controllers/expenseSubCategoryController");
const router = express_1.default.Router();
router.get("/", expenseSubCategoryController_1.getExpenseSubCategories);
router.post("/", expenseSubCategoryController_1.createExpenseSubCategory);
router.put("/:id", expenseSubCategoryController_1.updateExpenseSubCategory);
router.delete("/:id", expenseSubCategoryController_1.deleteExpenseSubCategory);
exports.default = router;
//# sourceMappingURL=expenseSubCategoryRoutes.js.map