"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appBannerController_1 = require("../controllers/appBannerController");
const router = express_1.default.Router();
router.get("/", appBannerController_1.getAppBanners);
router.post("/", appBannerController_1.createAppBanner);
router.put("/:id", appBannerController_1.updateAppBanner);
router.patch("/:id/toggle", appBannerController_1.toggleAppBannerStatus);
router.delete("/:id", appBannerController_1.deleteAppBanner);
exports.default = router;
