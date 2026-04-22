"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const visitExpenseAssignmentController_1 = require("../controllers/visitExpenseAssignmentController");
const router = express_1.default.Router();
router.get("/", visitExpenseAssignmentController_1.getVisitExpenseAssignments);
router.post("/", visitExpenseAssignmentController_1.createVisitExpenseAssignment);
router.put("/:id", visitExpenseAssignmentController_1.updateVisitExpenseAssignment);
router.delete("/:id", visitExpenseAssignmentController_1.deleteVisitExpenseAssignment);
exports.default = router;
