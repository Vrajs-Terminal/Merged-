"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenseSettingController_1 = require("../controllers/expenseSettingController");
const router = express_1.default.Router();
router.get("/", expenseSettingController_1.getExpenseSettings);
router.post("/", expenseSettingController_1.createExpenseSetting);
router.put("/:id", expenseSettingController_1.updateExpenseSetting);
router.delete("/:id", expenseSettingController_1.deleteExpenseSetting);
exports.default = router;
