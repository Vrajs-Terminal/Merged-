"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const onboardingController_1 = require("../controllers/onboardingController");
const router = express_1.default.Router();
router.get("/:employeeId", onboardingController_1.getOnboardingByEmployeeId);
router.post("/", onboardingController_1.createOnboarding);
router.put("/:employeeId", onboardingController_1.updateOnboarding);
exports.default = router;
//# sourceMappingURL=onboardingRoutes.js.map