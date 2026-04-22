"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const unitMeasureController_1 = require("../controllers/unitMeasureController");
const router = express_1.default.Router();
router.get('/', unitMeasureController_1.getUnits);
router.post('/', unitMeasureController_1.createUnit);
router.put('/:id', unitMeasureController_1.updateUnit);
router.delete('/:id', unitMeasureController_1.deleteUnit);
router.patch('/:id/toggle-status', unitMeasureController_1.toggleUnitStatus);
exports.default = router;
//# sourceMappingURL=unitMeasureRoutes.js.map