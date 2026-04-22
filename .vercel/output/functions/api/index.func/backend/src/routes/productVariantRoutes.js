"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productVariantController_1 = require("../controllers/productVariantController");
const router = express_1.default.Router();
router.get('/', productVariantController_1.getAllVariants);
router.get('/:id', productVariantController_1.getVariant);
router.post('/', productVariantController_1.createVariant);
router.put('/:id', productVariantController_1.updateVariant);
router.delete('/:id', productVariantController_1.deleteVariant);
router.patch('/:id/toggle-status', productVariantController_1.toggleVariantStatus);
exports.default = router;
//# sourceMappingURL=productVariantRoutes.js.map