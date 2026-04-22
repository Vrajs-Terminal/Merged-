"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faceXController_1 = require("../controllers/faceXController");
const router = express_1.default.Router();
// --- Face App Admin ---
router.get("/admins", faceXController_1.getFaceAppAdmins);
router.post("/admins/generate", faceXController_1.generateFaceAppAdmin);
router.delete("/admins/:id", faceXController_1.deleteFaceAppAdmin);
router.patch("/admins/:id/toggle", faceXController_1.toggleFaceAppAdminStatus);
// --- Face App Device ---
router.get("/devices", faceXController_1.getFaceAppDevices);
router.patch("/devices/:id/status", faceXController_1.updateDeviceStatus);
// --- User Face Data ---
router.get("/user-face-data", faceXController_1.getUserFaceData);
router.delete("/user-face-data/:id", faceXController_1.deleteUserFaceData);
// --- Face Change Request ---
router.get("/change-requests", faceXController_1.getFaceChangeRequests);
router.patch("/change-requests/:id/handle", faceXController_1.handleFaceChangeRequest);
// --- Face App Settings ---
router.get("/settings", faceXController_1.getFaceAppSettings);
router.patch("/settings", faceXController_1.updateFaceAppSettings);
exports.default = router;
