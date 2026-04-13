import express from "express";
import {
  createAdminAccessRule,
  deleteAdminAccessRule,
  getAdminAccessRules,
  getAdminPermissionConfig,
  getAppSettingsConfig,
  getOrderSettingsConfig,
  saveAdminPermissionConfig,
  saveAppSettingsConfig,
  saveOrderSettingsConfig,
} from "../controllers/adminSettingsController";

const router = express.Router();

router.get("/access-rules", getAdminAccessRules);
router.post("/access-rules", createAdminAccessRule);
router.delete("/access-rules/:id", deleteAdminAccessRule);

router.get("/permission-config", getAdminPermissionConfig);
router.put("/permission-config", saveAdminPermissionConfig);

router.get("/app-config", getAppSettingsConfig);
router.put("/app-config", saveAppSettingsConfig);

router.get("/order-config", getOrderSettingsConfig);
router.put("/order-config", saveOrderSettingsConfig);

export default router;
