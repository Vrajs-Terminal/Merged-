"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerCategoryController_1 = require("../controllers/customerCategoryController");
const router = express_1.default.Router();
router.get('/', customerCategoryController_1.getAllCustomerCategories);
router.get('/:id', customerCategoryController_1.getCustomerCategory);
router.post('/', customerCategoryController_1.createCustomerCategory);
router.put('/:id', customerCategoryController_1.updateCustomerCategory);
router.delete('/:id', customerCategoryController_1.deleteCustomerCategory);
router.patch('/:id/toggle-status', customerCategoryController_1.toggleCustomerCategoryStatus);
exports.default = router;
//# sourceMappingURL=customerCategoryRoutes.js.map