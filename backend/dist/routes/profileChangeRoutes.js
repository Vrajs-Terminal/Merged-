"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileChangeController_1 = require("../controllers/profileChangeController");
const router = express_1.default.Router();
router.post("/", profileChangeController_1.createProfileChangeRequest);
router.get("/", profileChangeController_1.getProfileChangeRequests);
router.put("/:id/approve", profileChangeController_1.approveProfileChangeRequest);
router.put("/:id/reject", profileChangeController_1.rejectProfileChangeRequest);
exports.default = router;
