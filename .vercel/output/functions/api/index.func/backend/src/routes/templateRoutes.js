"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const templateController_1 = require("../controllers/templateController");
const router = express_1.default.Router();
router.get("/", templateController_1.getTemplates);
router.get("/:id", templateController_1.getTemplateById);
router.post("/", templateController_1.createTemplate);
router.put("/:id", templateController_1.updateTemplate);
router.patch("/:id/toggle", templateController_1.toggleTemplateStatus);
router.delete("/:id", templateController_1.deleteTemplate);
exports.default = router;
//# sourceMappingURL=templateRoutes.js.map