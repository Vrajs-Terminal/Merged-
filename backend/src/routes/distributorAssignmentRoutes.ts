import express from "express";
import {
  createDistributorAssignments,
  deleteDistributorAssignment,
  deleteDistributorAssignmentsByEmployee,
  getDistributorAssignments,
} from "../controllers/distributorAssignmentController";

const router = express.Router();

router.get("/", getDistributorAssignments);
router.post("/", createDistributorAssignments);
router.delete("/:id", deleteDistributorAssignment);
router.delete("/employee/:employeeId", deleteDistributorAssignmentsByEmployee);

export default router;