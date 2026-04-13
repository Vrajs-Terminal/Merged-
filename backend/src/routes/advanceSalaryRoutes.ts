import express from "express";
import {
    getAdvanceSalaries,
    createAdvanceSalary,
    createBulkAdvanceSalary,
    updateAdvanceSalary,
    deleteAdvanceSalary,
    returnAdvanceSalary
} from "../controllers/advanceSalaryController";

const router = express.Router();

router.get("/", getAdvanceSalaries);
router.post("/", createAdvanceSalary);
router.post("/bulk", createBulkAdvanceSalary);
router.put("/:id", updateAdvanceSalary);
router.delete("/:id", deleteAdvanceSalary);
router.post("/:id/return", returnAdvanceSalary);

export default router;
