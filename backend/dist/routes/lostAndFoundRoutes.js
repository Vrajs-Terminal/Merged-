"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lostAndFoundController_1 = require("../controllers/lostAndFoundController");
const router = express_1.default.Router();
router.post('/items', lostAndFoundController_1.reportItem);
router.get('/items', lostAndFoundController_1.getItems);
router.put('/items/:id', lostAndFoundController_1.updateItemStatus);
router.delete('/items/:id', lostAndFoundController_1.deleteItem);
router.post('/claims', lostAndFoundController_1.claimItem);
router.get('/claims', lostAndFoundController_1.getClaims);
router.put('/claims/:id', lostAndFoundController_1.verifyClaim);
exports.default = router;
