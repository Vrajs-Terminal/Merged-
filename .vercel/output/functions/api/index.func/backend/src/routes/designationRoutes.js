"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const designationController_1 = require("../controllers/designationController");
const router = express_1.default.Router();
router.get('/', designationController_1.getDesignations);
router.post('/', designationController_1.createDesignation);
router.put('/:id', designationController_1.updateDesignation);
router.post('/bulk-transfer', designationController_1.bulkTransferDesignation);
exports.default = router;
//# sourceMappingURL=designationRoutes.js.map