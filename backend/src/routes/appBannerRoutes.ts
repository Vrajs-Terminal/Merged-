import express from "express";
import {
  createAppBanner,
  deleteAppBanner,
  getAppBanners,
  toggleAppBannerStatus,
  updateAppBanner,
} from "../controllers/appBannerController";

const router = express.Router();

router.get("/", getAppBanners);
router.post("/", createAppBanner);
router.put("/:id", updateAppBanner);
router.patch("/:id/toggle", toggleAppBannerStatus);
router.delete("/:id", deleteAppBanner);

export default router;
