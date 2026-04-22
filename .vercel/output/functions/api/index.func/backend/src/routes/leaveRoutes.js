"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveController_1 = require("../controllers/leaveController");
const router = (0, express_1.Router)();
// Leave Types
router.get("/types", leaveController_1.getLeaveTypes);
router.post("/types", leaveController_1.createLeaveType);
router.put("/types/:id", leaveController_1.updateLeaveType);
router.delete("/types/:id", leaveController_1.deleteLeaveType);
// Leave Policy
router.get("/policies", leaveController_1.getLeavePolicies);
router.post("/policies", leaveController_1.upsertLeavePolicy);
// Leave Balances
router.get("/balances", leaveController_1.getAllLeaveBalances);
router.get("/balances/:employeeId", leaveController_1.getLeaveBalances);
router.post("/balances/adjust", leaveController_1.adjustLeaveBalance);
router.post("/balances/init", leaveController_1.initBalancesForAll);
// Leave Requests
router.get("/requests", leaveController_1.getLeaveRequests);
router.post("/requests", leaveController_1.submitLeaveRequest);
router.put("/requests/:id/review", leaveController_1.reviewLeaveRequest);
router.put("/requests/:id/cancel", leaveController_1.cancelLeaveRequest);
// Leave Calendar
router.get("/calendar", leaveController_1.getLeaveCalendar);
// Leave Reports
router.get("/reports", leaveController_1.getLeaveReport);
// Leave Settings
router.get("/settings", leaveController_1.getLeaveSettings);
router.put("/settings", leaveController_1.updateLeaveSettings);
// Leave Reasons
router.get("/reasons", leaveController_1.getLeaveReasons);
router.post("/reasons", leaveController_1.createLeaveReason);
router.put("/reasons/:id", leaveController_1.updateLeaveReason);
router.delete("/reasons/:id", leaveController_1.deleteLeaveReason);
// Leave Groups
router.get("/groups", leaveController_1.getLeaveGroups);
router.post("/groups", leaveController_1.createLeaveGroup);
router.put("/groups/:id", leaveController_1.updateLeaveGroup);
router.delete("/groups/:id", leaveController_1.deleteLeaveGroup);
router.post("/groups/assign", leaveController_1.assignLeaveGroup);
// Auto Leaves
router.get("/auto", leaveController_1.getAutoLeaves);
router.delete("/auto/:id", leaveController_1.deleteAutoLeave);
// Leave Payouts
router.get("/payouts", leaveController_1.getLeavePayouts);
router.post("/payouts", leaveController_1.submitLeavePayout);
router.put("/payouts/:id/review", leaveController_1.reviewLeavePayout);
// Short Leaves
router.get("/short", leaveController_1.getShortLeaves);
router.post("/short", leaveController_1.submitShortLeave);
router.put("/short/:id/review", leaveController_1.reviewShortLeave);
exports.default = router;
//# sourceMappingURL=leaveRoutes.js.map