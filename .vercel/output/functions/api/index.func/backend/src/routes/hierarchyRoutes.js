"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hierarchyController_1 = require("../controllers/hierarchyController");
const router = express_1.default.Router();
router.get("/", hierarchyController_1.getHierarchy);
router.get("/levels", hierarchyController_1.getLevelHierarchy);
exports.default = router;
//# sourceMappingURL=hierarchyRoutes.js.map