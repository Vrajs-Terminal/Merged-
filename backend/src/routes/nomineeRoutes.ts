import express from "express";
import {
  createNominationType,
  getNominationTypes,
  updateNominationType,
  deleteNominationType,
  addEmployeeNominee,
  getEmployeeNominees,
  bulkUploadNominees,
  deleteEmployeeNominee
} from "../controllers/nomineeController";

const router = express.Router();

// Master Setup
router.post("/types", createNominationType);
router.get("/types", getNominationTypes);
router.put("/types/:id", updateNominationType);
router.delete("/types/:id", deleteNominationType);

// Employee Nominees
router.post("/", addEmployeeNominee);
router.get("/", getEmployeeNominees);
router.post("/bulk", bulkUploadNominees);
router.delete("/:id", deleteEmployeeNominee);

export default router;
