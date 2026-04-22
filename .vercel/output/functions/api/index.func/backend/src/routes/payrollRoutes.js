"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payrollController_1 = require("../controllers/payrollController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/runs", authMiddleware_1.authenticateToken, payrollController_1.getPayrollRuns);
router.post("/generate", authMiddleware_1.authenticateToken, payrollController_1.generatePayroll);
router.get("/runs/:runId/payslips", authMiddleware_1.authenticateToken, payrollController_1.getPayslips);
router.delete("/runs/:runId", authMiddleware_1.authenticateToken, payrollController_1.deletePayrollRun);
exports.default = router;
//# sourceMappingURL=payrollRoutes.js.map