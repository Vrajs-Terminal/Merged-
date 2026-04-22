"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deviceController_1 = require("../controllers/deviceController");
const router = express_1.default.Router();
router.get('/', deviceController_1.getDevices);
router.post('/', deviceController_1.createDevice);
router.put('/:id', deviceController_1.updateDevice);
router.delete('/:id', deviceController_1.deleteDevice);
exports.default = router;
//# sourceMappingURL=deviceRoutes.js.map