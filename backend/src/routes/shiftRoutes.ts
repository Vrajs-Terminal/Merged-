import express from "express";
import {
    createShift,
    getShifts,
    getShiftById,
    updateShift,
    deleteShift,
    assignShift,
    getAssignments,
    deactivateAssignment,
    createRotation,
    getRotations,
    updateRotation,
    deleteRotation,
    getShiftStats,
    createShiftChangeRequest,
    getShiftChangeRequests,
    updateShiftChangeStatus,
    createPenaltyRule,
    getPenaltyRules,
    deletePenaltyRule
} from "../controllers/shiftController";

const router = express.Router();

// ── Stats (must be before /:id) ──
router.get("/stats", getShiftStats);

// ── Assignments (must be before /:id) ──
router.post("/assignments/assign", assignShift);
router.get("/assignments/list", getAssignments);
router.put("/assignments/:id/deactivate", deactivateAssignment);

// ── Rotations (must be before /:id) ──
router.post("/rotations", createRotation);
router.get("/rotations/list", getRotations);
router.put("/rotations/:id", updateRotation);
router.delete("/rotations/:id", deleteRotation);

// ── Shift Change Requests ──
router.post("/change-requests", createShiftChangeRequest);
router.get("/change-requests", getShiftChangeRequests);
router.patch("/change-requests/:id", updateShiftChangeStatus);

// ── Penalty Rules ──
router.post("/penalty-rules", createPenaltyRule);
router.get("/penalty-rules", getPenaltyRules);
router.delete("/penalty-rules/:id", deletePenaltyRule);

// ── Shifts CRUD ──
router.post("/", createShift);
router.get("/", getShifts);
router.get("/:id", getShiftById);
router.put("/:id", updateShift);
router.delete("/:id", deleteShift);

export default router;
