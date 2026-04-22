"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productSubCategoryController_1 = require("../controllers/productSubCategoryController");
const router = express_1.default.Router();
router.get('/', productSubCategoryController_1.getAllSubCategories);
router.get('/:id', productSubCategoryController_1.getSubCategory);
router.post('/', productSubCategoryController_1.createSubCategory);
router.put('/:id', productSubCategoryController_1.updateSubCategory);
router.delete('/:id', productSubCategoryController_1.deleteSubCategory);
router.patch('/:id/toggle-status', productSubCategoryController_1.toggleSubCategoryStatus);
exports.default = router;
