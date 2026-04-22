"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const departmentController_1 = require("../controllers/departmentController");
const router = express_1.default.Router();
router.get('/', departmentController_1.getDepartments);
router.post('/', departmentController_1.createDepartment);
router.put('/:id', departmentController_1.updateDepartment);
router.post('/bulk-transfer', departmentController_1.bulkTransferDepartment);
exports.default = router;
