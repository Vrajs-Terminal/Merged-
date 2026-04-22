"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quotationConfigController_1 = require("../controllers/quotationConfigController");
const router = express_1.default.Router();
router.get("/", quotationConfigController_1.getQuotationConfigs);
router.post("/update", quotationConfigController_1.updateQuotationConfigs);
exports.default = router;
