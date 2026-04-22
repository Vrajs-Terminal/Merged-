"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shiftController_1 = require("../controllers/shiftController");
const router = express_1.default.Router();
// ── Stats (must be before /:id) ──
router.get("/stats", shiftController_1.getShiftStats);
// ── Assignments (must be before /:id) ──
router.post("/assignments/assign", shiftController_1.assignShift);
router.get("/assignments/list", shiftController_1.getAssignments);
router.put("/assignments/:id/deactivate", shiftController_1.deactivateAssignment);
// ── Rotations (must be before /:id) ──
router.post("/rotations", shiftController_1.createRotation);
router.get("/rotations/list", shiftController_1.getRotations);
router.put("/rotations/:id", shiftController_1.updateRotation);
router.delete("/rotations/:id", shiftController_1.deleteRotation);
// ── Shift Change Requests ──
router.post("/change-requests", shiftController_1.createShiftChangeRequest);
router.get("/change-requests", shiftController_1.getShiftChangeRequests);
router.patch("/change-requests/:id", shiftController_1.updateShiftChangeStatus);
// ── Penalty Rules ──
router.post("/penalty-rules", shiftController_1.createPenaltyRule);
router.get("/penalty-rules", shiftController_1.getPenaltyRules);
router.delete("/penalty-rules/:id", shiftController_1.deletePenaltyRule);
// ── Shifts CRUD ──
router.post("/", shiftController_1.createShift);
router.get("/", shiftController_1.getShifts);
router.get("/:id", shiftController_1.getShiftById);
router.put("/:id", shiftController_1.updateShift);
router.delete("/:id", shiftController_1.deleteShift);
exports.default = router;
