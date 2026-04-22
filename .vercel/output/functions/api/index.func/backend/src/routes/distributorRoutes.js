"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const distributorController_1 = require("../controllers/distributorController");
const router = express_1.default.Router();
router.get('/', distributorController_1.getAllDistributors);
router.get('/:id', distributorController_1.getDistributor);
router.post('/', distributorController_1.createDistributor);
router.put('/:id', distributorController_1.updateDistributor);
router.delete('/:id', distributorController_1.deleteDistributor);
router.patch('/:id/toggle-status', distributorController_1.toggleDistributorStatus);
exports.default = router;
//# sourceMappingURL=distributorRoutes.js.map