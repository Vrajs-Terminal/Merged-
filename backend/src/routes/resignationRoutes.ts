import express from "express";
import {
    getResignations,
    submitResignation,
    approveResignation,
    rejectResignation
} from "../controllers/resignationController";

const router = express.Router();

router.get("/", getResignations);
router.post("/", submitResignation);
router.put("/:id/approve", approveResignation);
router.put("/:id/reject", rejectResignation);

export default router;
