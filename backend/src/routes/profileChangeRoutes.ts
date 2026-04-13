import express from "express";
import {
    createProfileChangeRequest,
    getProfileChangeRequests,
    approveProfileChangeRequest,
    rejectProfileChangeRequest
} from "../controllers/profileChangeController";

const router = express.Router();

router.post("/", createProfileChangeRequest);
router.get("/", getProfileChangeRequests);
router.put("/:id/approve", approveProfileChangeRequest);
router.put("/:id/reject", rejectProfileChangeRequest);

export default router;
