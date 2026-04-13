import { Router } from "express";
import {
    getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
    getLeavePolicies, upsertLeavePolicy,
    getAllLeaveBalances, getLeaveBalances, adjustLeaveBalance, initBalancesForAll,
    submitLeaveRequest, getLeaveRequests, reviewLeaveRequest, cancelLeaveRequest,
    getLeaveCalendar,
    getLeaveReport,
    getLeaveSettings, updateLeaveSettings,
    getLeaveReasons, createLeaveReason, updateLeaveReason, deleteLeaveReason,
    getLeaveGroups, createLeaveGroup, updateLeaveGroup, deleteLeaveGroup, assignLeaveGroup,
    getAutoLeaves, deleteAutoLeave,
    getLeavePayouts, submitLeavePayout, reviewLeavePayout,
    getShortLeaves, submitShortLeave, reviewShortLeave
} from "../controllers/leaveController";

const router = Router();

// Leave Types
router.get("/types", getLeaveTypes);
router.post("/types", createLeaveType);
router.put("/types/:id", updateLeaveType);
router.delete("/types/:id", deleteLeaveType);

// Leave Policy
router.get("/policies", getLeavePolicies);
router.post("/policies", upsertLeavePolicy);

// Leave Balances
router.get("/balances", getAllLeaveBalances);
router.get("/balances/:employeeId", getLeaveBalances);
router.post("/balances/adjust", adjustLeaveBalance);
router.post("/balances/init", initBalancesForAll);

// Leave Requests
router.get("/requests", getLeaveRequests);
router.post("/requests", submitLeaveRequest);
router.put("/requests/:id/review", reviewLeaveRequest);
router.put("/requests/:id/cancel", cancelLeaveRequest);

// Leave Calendar
router.get("/calendar", getLeaveCalendar);

// Leave Reports
router.get("/reports", getLeaveReport);

// Leave Settings
router.get("/settings", getLeaveSettings);
router.put("/settings", updateLeaveSettings);

// Leave Reasons
router.get("/reasons", getLeaveReasons);
router.post("/reasons", createLeaveReason);
router.put("/reasons/:id", updateLeaveReason);
router.delete("/reasons/:id", deleteLeaveReason);

// Leave Groups
router.get("/groups", getLeaveGroups);
router.post("/groups", createLeaveGroup);
router.put("/groups/:id", updateLeaveGroup);
router.delete("/groups/:id", deleteLeaveGroup);
router.post("/groups/assign", assignLeaveGroup);

// Auto Leaves
router.get("/auto", getAutoLeaves);
router.delete("/auto/:id", deleteAutoLeave);

// Leave Payouts
router.get("/payouts", getLeavePayouts);
router.post("/payouts", submitLeavePayout);
router.put("/payouts/:id/review", reviewLeavePayout);

// Short Leaves
router.get("/short", getShortLeaves);
router.post("/short", submitShortLeave);
router.put("/short/:id/review", reviewShortLeave);

export default router;
