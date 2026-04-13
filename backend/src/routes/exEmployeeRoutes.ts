import express from "express";
import {
    getExEmployees,
    getExEmployeeById,
    createExEmployee,
} from "../controllers/exEmployeeController";

const router = express.Router();

router.get("/", getExEmployees);
router.get("/:id", getExEmployeeById);
router.post("/", createExEmployee);

export default router;
