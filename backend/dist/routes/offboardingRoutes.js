"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const offboardingController_1 = require("../controllers/offboardingController");
const router = express_1.default.Router();
router.get("/", offboardingController_1.getOffboardings);
router.post("/initiate", offboardingController_1.initiateOffboarding);
router.put("/checklist/:checklistId", offboardingController_1.updateChecklist);
router.delete("/:id", offboardingController_1.cancelOffboarding);
exports.default = router;
