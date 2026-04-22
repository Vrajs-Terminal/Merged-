"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const engagementController_1 = require("../controllers/engagementController");
const router = express_1.default.Router();
router.get("/upcoming", engagementController_1.getUpcomingEvents);
exports.default = router;
//# sourceMappingURL=engagementRoutes.js.map