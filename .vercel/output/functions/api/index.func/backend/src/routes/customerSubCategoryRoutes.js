"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerSubCategoryController_1 = require("../controllers/customerSubCategoryController");
const router = express_1.default.Router();
router.get('/', customerSubCategoryController_1.getAllCustomerSubCategories);
router.get('/:id', customerSubCategoryController_1.getCustomerSubCategory);
router.post('/', customerSubCategoryController_1.createCustomerSubCategory);
router.put('/:id', customerSubCategoryController_1.updateCustomerSubCategory);
router.delete('/:id', customerSubCategoryController_1.deleteCustomerSubCategory);
router.patch('/:id/toggle-status', customerSubCategoryController_1.toggleCustomerSubCategoryStatus);
exports.default = router;
//# sourceMappingURL=customerSubCategoryRoutes.js.map