"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const retailerController_1 = require("../controllers/retailerController");
const router = express_1.default.Router();
router.get('/', retailerController_1.getAllRetailers);
router.get('/:id', retailerController_1.getRetailer);
router.post('/', retailerController_1.createRetailer);
router.put('/:id', retailerController_1.updateRetailer);
router.delete('/:id', retailerController_1.deleteRetailer);
router.patch('/:id/toggle-status', retailerController_1.toggleRetailerStatus);
exports.default = router;
//# sourceMappingURL=retailerRoutes.js.map