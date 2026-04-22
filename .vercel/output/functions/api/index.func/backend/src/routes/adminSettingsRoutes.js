"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminSettingsController_1 = require("../controllers/adminSettingsController");
const router = express_1.default.Router();
router.get("/access-rules", adminSettingsController_1.getAdminAccessRules);
router.post("/access-rules", adminSettingsController_1.createAdminAccessRule);
router.delete("/access-rules/:id", adminSettingsController_1.deleteAdminAccessRule);
router.get("/permission-config", adminSettingsController_1.getAdminPermissionConfig);
router.put("/permission-config", adminSettingsController_1.saveAdminPermissionConfig);
router.get("/app-config", adminSettingsController_1.getAppSettingsConfig);
router.put("/app-config", adminSettingsController_1.saveAppSettingsConfig);
router.get("/order-config", adminSettingsController_1.getOrderSettingsConfig);
router.put("/order-config", adminSettingsController_1.saveOrderSettingsConfig);
exports.default = router;
//# sourceMappingURL=adminSettingsRoutes.js.map