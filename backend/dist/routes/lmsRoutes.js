"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lmsController_1 = require("../controllers/lmsController");
const router = express_1.default.Router();
router.get("/courses", lmsController_1.getLmsCourses);
router.post("/courses", lmsController_1.createLmsCourse);
router.put("/courses/:id", lmsController_1.updateLmsCourse);
router.delete("/courses/:id", lmsController_1.deleteLmsCourse);
router.get("/report", lmsController_1.getLmsReport);
router.post("/progress", lmsController_1.createLmsProgress);
exports.default = router;
