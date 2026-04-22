"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const beatPlanController_1 = require("../controllers/beatPlanController");
const router = express_1.default.Router();
router.get('/', beatPlanController_1.getAllBeatPlans);
router.get('/:id', beatPlanController_1.getBeatPlan);
router.post('/', beatPlanController_1.createBeatPlan);
router.put('/:id', beatPlanController_1.updateBeatPlan);
router.delete('/:id', beatPlanController_1.deleteBeatPlan);
router.patch('/:id/toggle-status', beatPlanController_1.toggleBeatPlanStatus);
exports.default = router;
