"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const exEmployeeController_1 = require("../controllers/exEmployeeController");
const router = express_1.default.Router();
router.get("/", exEmployeeController_1.getExEmployees);
router.get("/:id", exEmployeeController_1.getExEmployeeById);
router.post("/", exEmployeeController_1.createExEmployee);
exports.default = router;
//# sourceMappingURL=exEmployeeRoutes.js.map