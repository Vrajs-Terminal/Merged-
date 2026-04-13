import express from "express";
import {
    getVisitExpenseAssignments,
    createVisitExpenseAssignment,
    updateVisitExpenseAssignment,
    deleteVisitExpenseAssignment
} from "../controllers/visitExpenseAssignmentController";

const router = express.Router();

router.get("/", getVisitExpenseAssignments);
router.post("/", createVisitExpenseAssignment);
router.put("/:id", updateVisitExpenseAssignment);
router.delete("/:id", deleteVisitExpenseAssignment);

export default router;
