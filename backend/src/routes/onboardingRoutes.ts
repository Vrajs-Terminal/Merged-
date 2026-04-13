import express from "express";
import {
    getOnboardingByEmployeeId,
    createOnboarding,
    updateOnboarding,
} from "../controllers/onboardingController";

const router = express.Router();

router.get("/:employeeId", getOnboardingByEmployeeId);
router.post("/", createOnboarding);
router.put("/:employeeId", updateOnboarding);

export default router;
