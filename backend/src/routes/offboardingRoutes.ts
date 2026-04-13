import express from "express";
import {
    getOffboardings,
    initiateOffboarding,
    updateChecklist,
    cancelOffboarding
} from "../controllers/offboardingController";

const router = express.Router();

router.get("/", getOffboardings);
router.post("/initiate", initiateOffboarding);
router.put("/checklist/:checklistId", updateChecklist);
router.delete("/:id", cancelOffboarding);

export default router;
