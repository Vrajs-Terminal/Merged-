"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const penaltyController_1 = require("../controllers/penaltyController");
const router = (0, express_1.Router)();
// Penalty Rules
router.post("/rules", penaltyController_1.PenaltyController.createRule);
router.get("/rules", penaltyController_1.PenaltyController.getRules);
router.put("/rules/:id", penaltyController_1.PenaltyController.updateRule);
router.delete("/rules/:id", penaltyController_1.PenaltyController.deleteRule);
// Penalty Conversions
router.post("/conversions", penaltyController_1.PenaltyController.createConversion);
router.get("/conversions", penaltyController_1.PenaltyController.getConversions);
// Penalty Records
router.get("/records", penaltyController_1.PenaltyController.getRecords);
router.put("/records/:id/approve", penaltyController_1.PenaltyController.approvePenalty);
router.put("/records/:id/reject", penaltyController_1.PenaltyController.rejectPenalty);
router.delete("/records/:id", penaltyController_1.PenaltyController.deleteRecord);
// Reports
router.get("/report", penaltyController_1.PenaltyController.getReport);
exports.default = router;
//# sourceMappingURL=penaltyRoutes.js.map