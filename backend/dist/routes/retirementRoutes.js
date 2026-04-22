"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const retirementController_1 = require("../controllers/retirementController");
const router = express_1.default.Router();
router.get("/", retirementController_1.getUpcomingRetirements);
exports.default = router;
