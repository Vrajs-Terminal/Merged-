"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const templateQuestionController_1 = require("../controllers/templateQuestionController");
const router = express_1.default.Router();
router.get("/template/:templateId", templateQuestionController_1.getQuestionsByTemplate);
router.post("/", templateQuestionController_1.createQuestion);
router.put("/:id", templateQuestionController_1.updateQuestion);
router.delete("/:id", templateQuestionController_1.deleteQuestion);
exports.default = router;
//# sourceMappingURL=templateQuestionRoutes.js.map