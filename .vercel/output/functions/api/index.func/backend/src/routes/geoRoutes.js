"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const geoController_1 = require("../controllers/geoController");
const router = express_1.default.Router();
// States
router.get('/states', geoController_1.getStates);
// Cities
router.get('/cities', geoController_1.getCities);
router.post('/cities', geoController_1.createCity);
router.put('/cities/:id', geoController_1.updateCity);
router.delete('/cities/:id', geoController_1.deleteCity);
// Areas
router.get('/areas', geoController_1.getAreas);
router.post('/areas', geoController_1.createArea);
router.put('/areas/:id', geoController_1.updateArea);
router.delete('/areas/:id', geoController_1.deleteArea);
// Sales Routes
router.get('/routes', geoController_1.getSalesRoutes);
router.post('/routes', geoController_1.createSalesRoute);
router.put('/routes/:id', geoController_1.updateSalesRoute);
router.delete('/routes/:id', geoController_1.deleteSalesRoute);
// Employee Route Assignment
router.get('/employee-routes', geoController_1.getEmployeeRoutes);
router.post('/employee-routes', geoController_1.assignEmployeeRoute);
exports.default = router;
//# sourceMappingURL=geoRoutes.js.map