"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resignationController_1 = require("../controllers/resignationController");
const router = express_1.default.Router();
router.get("/", resignationController_1.getResignations);
router.post("/", resignationController_1.submitResignation);
router.put("/:id/approve", resignationController_1.approveResignation);
router.put("/:id/reject", resignationController_1.rejectResignation);
exports.default = router;
//# sourceMappingURL=resignationRoutes.js.map