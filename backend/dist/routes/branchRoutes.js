"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const branchController_1 = require("../controllers/branchController");
const router = express_1.default.Router();
router.get('/', branchController_1.getBranches);
router.post('/', branchController_1.createBranch);
router.put('/:id', branchController_1.updateBranch);
router.post('/bulk-transfer', branchController_1.bulkTransferBranch);
exports.default = router;
