"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advanceSalaryController_1 = require("../controllers/advanceSalaryController");
const router = express_1.default.Router();
router.get("/", advanceSalaryController_1.getAdvanceSalaries);
router.post("/", advanceSalaryController_1.createAdvanceSalary);
router.post("/bulk", advanceSalaryController_1.createBulkAdvanceSalary);
router.put("/:id", advanceSalaryController_1.updateAdvanceSalary);
router.delete("/:id", advanceSalaryController_1.deleteAdvanceSalary);
router.post("/:id/return", advanceSalaryController_1.returnAdvanceSalary);
exports.default = router;
