"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bulkUpdateController_1 = require("../controllers/bulkUpdateController");
const router = express_1.default.Router();
router.get("/template", bulkUpdateController_1.generateTemplate);
router.post("/validate", bulkUpdateController_1.validateBulkUpdate);
router.post("/apply", bulkUpdateController_1.applyBulkUpdate);
exports.default = router;
//# sourceMappingURL=bulkUpdateRoutes.js.map