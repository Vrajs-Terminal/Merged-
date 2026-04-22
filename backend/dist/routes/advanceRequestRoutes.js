"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advanceRequestController_1 = require("../controllers/advanceRequestController");
const router = express_1.default.Router();
router.get("/", advanceRequestController_1.getRequests);
router.post("/", advanceRequestController_1.createRequest);
router.put("/:id/status", advanceRequestController_1.updateRequestStatus);
router.delete("/:id", advanceRequestController_1.deleteRequest);
exports.default = router;
