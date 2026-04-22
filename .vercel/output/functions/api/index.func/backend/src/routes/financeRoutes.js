"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const financeController_1 = require("../controllers/financeController");
const router = express_1.default.Router();
router.get("/", financeController_1.getFinances);
router.get("/:id", financeController_1.getFinanceById);
router.post("/", financeController_1.createFinance);
exports.default = router;
//# sourceMappingURL=financeRoutes.js.map