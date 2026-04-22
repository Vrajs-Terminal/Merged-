"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productCategoryController_1 = require("../controllers/productCategoryController");
const router = express_1.default.Router();
router.get('/', productCategoryController_1.getAllCategories);
router.get('/:id', productCategoryController_1.getCategory);
router.post('/', productCategoryController_1.createCategory);
router.put('/:id', productCategoryController_1.updateCategory);
router.delete('/:id', productCategoryController_1.deleteCategory);
router.patch('/:id/toggle-status', productCategoryController_1.toggleCategoryStatus);
exports.default = router;
//# sourceMappingURL=productCategoryRoutes.js.map