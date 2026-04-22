"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const celebrationTemplateController_1 = require("../controllers/celebrationTemplateController");
const router = express_1.default.Router();
router.get("/", celebrationTemplateController_1.getTemplates);
router.post("/", celebrationTemplateController_1.createTemplate);
router.put("/:id", celebrationTemplateController_1.updateTemplate);
router.delete("/:id", celebrationTemplateController_1.deleteTemplate);
exports.default = router;
