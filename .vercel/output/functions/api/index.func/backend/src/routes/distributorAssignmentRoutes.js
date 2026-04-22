"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const distributorAssignmentController_1 = require("../controllers/distributorAssignmentController");
const router = express_1.default.Router();
router.get("/", distributorAssignmentController_1.getDistributorAssignments);
router.post("/", distributorAssignmentController_1.createDistributorAssignments);
router.delete("/:id", distributorAssignmentController_1.deleteDistributorAssignment);
router.delete("/employee/:employeeId", distributorAssignmentController_1.deleteDistributorAssignmentsByEmployee);
exports.default = router;
//# sourceMappingURL=distributorAssignmentRoutes.js.map