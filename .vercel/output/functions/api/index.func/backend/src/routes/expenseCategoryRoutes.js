"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenseCategoryController_1 = require("../controllers/expenseCategoryController");
const router = express_1.default.Router();
router.get("/", expenseCategoryController_1.getExpenseCategories);
router.post("/", expenseCategoryController_1.createExpenseCategory);
router.put("/:id", expenseCategoryController_1.updateExpenseCategory);
router.delete("/:id", expenseCategoryController_1.deleteExpenseCategory);
exports.default = router;
//# sourceMappingURL=expenseCategoryRoutes.js.map