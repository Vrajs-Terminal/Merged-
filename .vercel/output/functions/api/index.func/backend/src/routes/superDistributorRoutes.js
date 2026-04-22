"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const superDistributorController_1 = require("../controllers/superDistributorController");
const router = express_1.default.Router();
router.get('/', superDistributorController_1.getAllSuperDistributors);
router.get('/:id', superDistributorController_1.getSuperDistributor);
router.post('/', superDistributorController_1.createSuperDistributor);
router.put('/:id', superDistributorController_1.updateSuperDistributor);
router.delete('/:id', superDistributorController_1.deleteSuperDistributor);
router.patch('/:id/toggle-status', superDistributorController_1.toggleSuperDistributorStatus);
exports.default = router;
//# sourceMappingURL=superDistributorRoutes.js.map