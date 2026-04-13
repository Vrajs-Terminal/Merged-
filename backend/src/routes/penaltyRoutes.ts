import { Router } from "express";
import { PenaltyController } from "../controllers/penaltyController";

const router = Router();

// Penalty Rules
router.post("/rules", PenaltyController.createRule);
router.get("/rules", PenaltyController.getRules);
router.put("/rules/:id", PenaltyController.updateRule);
router.delete("/rules/:id", PenaltyController.deleteRule);

// Penalty Conversions
router.post("/conversions", PenaltyController.createConversion);
router.get("/conversions", PenaltyController.getConversions);

// Penalty Records
router.get("/records", PenaltyController.getRecords);
router.put("/records/:id/approve", PenaltyController.approvePenalty);
router.put("/records/:id/reject", PenaltyController.rejectPenalty);
router.delete("/records/:id", PenaltyController.deleteRecord);

// Reports
router.get("/report", PenaltyController.getReport);

export default router;
