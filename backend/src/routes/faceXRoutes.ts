import express from "express";
import { 
    getFaceAppAdmins, 
    generateFaceAppAdmin, 
    deleteFaceAppAdmin, 
    toggleFaceAppAdminStatus,
    getFaceAppDevices,
    updateDeviceStatus,
    getUserFaceData,
    deleteUserFaceData,
    getFaceChangeRequests,
    handleFaceChangeRequest,
    getFaceAppSettings,
    updateFaceAppSettings
} from "../controllers/faceXController";

const router = express.Router();

// --- Face App Admin ---
router.get("/admins", getFaceAppAdmins);
router.post("/admins/generate", generateFaceAppAdmin);
router.delete("/admins/:id", deleteFaceAppAdmin);
router.patch("/admins/:id/toggle", toggleFaceAppAdminStatus);

// --- Face App Device ---
router.get("/devices", getFaceAppDevices);
router.patch("/devices/:id/status", updateDeviceStatus);

// --- User Face Data ---
router.get("/user-face-data", getUserFaceData);
router.delete("/user-face-data/:id", deleteUserFaceData);

// --- Face Change Request ---
router.get("/change-requests", getFaceChangeRequests);
router.patch("/change-requests/:id/handle", handleFaceChangeRequest);

// --- Face App Settings ---
router.get("/settings", getFaceAppSettings);
router.patch("/settings", updateFaceAppSettings);

export default router;
