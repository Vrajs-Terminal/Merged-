"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employeeController_1 = require("../controllers/employeeController");
const router = express_1.default.Router();
router.get("/", employeeController_1.getEmployees);
router.get("/retirements/upcoming", employeeController_1.getUpcomingRetirements);
router.get("/:id", employeeController_1.getEmployeeById);
router.post("/", employeeController_1.createEmployee);
router.put("/:id", employeeController_1.updateEmployee);
router.put("/:id/disable", employeeController_1.disableEmployee);
router.put("/:id/reactivate", employeeController_1.reactivateEmployee);
exports.default = router;
