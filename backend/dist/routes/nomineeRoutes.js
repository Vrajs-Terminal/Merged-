"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nomineeController_1 = require("../controllers/nomineeController");
const router = express_1.default.Router();
// Master Setup
router.post("/types", nomineeController_1.createNominationType);
router.get("/types", nomineeController_1.getNominationTypes);
router.put("/types/:id", nomineeController_1.updateNominationType);
router.delete("/types/:id", nomineeController_1.deleteNominationType);
// Employee Nominees
router.post("/", nomineeController_1.addEmployeeNominee);
router.get("/", nomineeController_1.getEmployeeNominees);
router.post("/bulk", nomineeController_1.bulkUploadNominees);
router.delete("/:id", nomineeController_1.deleteEmployeeNominee);
exports.default = router;
