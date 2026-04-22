"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobLocationController_1 = require("../controllers/jobLocationController");
const router = express_1.default.Router();
router.get('/', jobLocationController_1.getAllJobLocations);
router.get('/employee/:employeeId', jobLocationController_1.getJobLocation);
router.post('/', jobLocationController_1.createJobLocation);
router.put('/:employeeId', jobLocationController_1.updateJobLocation);
router.delete('/:employeeId', jobLocationController_1.deleteJobLocation);
exports.default = router;
//# sourceMappingURL=jobLocationRoutes.js.map