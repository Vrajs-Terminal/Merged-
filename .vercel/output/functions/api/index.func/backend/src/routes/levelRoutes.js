"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const levelController_1 = require("../controllers/levelController");
const router = express_1.default.Router();
router.get("/hierarchy", levelController_1.getLevelHierarchy);
router.get("/:id/history", levelController_1.getEmployeeLevelHistory);
router.post("/assign", levelController_1.assignLevel);
router.get("/", levelController_1.getLevels);
router.post("/", levelController_1.createLevel);
router.put("/:id", levelController_1.updateLevel);
router.delete("/:id", levelController_1.deleteLevel);
exports.default = router;
//# sourceMappingURL=levelRoutes.js.map