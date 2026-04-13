import express from "express";
import {
    getRequests,
    createRequest,
    updateRequestStatus,
    deleteRequest
} from "../controllers/advanceRequestController";

const router = express.Router();

router.get("/", getRequests);
router.post("/", createRequest);
router.put("/:id/status", updateRequestStatus);
router.delete("/:id", deleteRequest);

export default router;
