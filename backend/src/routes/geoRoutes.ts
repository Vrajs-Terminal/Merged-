import express from 'express';
import {
  getStates,
  getCities, createCity, updateCity, deleteCity,
  getAreas, createArea, updateArea, deleteArea,
  getSalesRoutes, createSalesRoute, updateSalesRoute, deleteSalesRoute,
  getEmployeeRoutes, assignEmployeeRoute
} from '../controllers/geoController';

const router = express.Router();

// States
router.get('/states', getStates);

// Cities
router.get('/cities', getCities);
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);
router.delete('/cities/:id', deleteCity);

// Areas
router.get('/areas', getAreas);
router.post('/areas', createArea);
router.put('/areas/:id', updateArea);
router.delete('/areas/:id', deleteArea);

// Sales Routes
router.get('/routes', getSalesRoutes);
router.post('/routes', createSalesRoute);
router.put('/routes/:id', updateSalesRoute);
router.delete('/routes/:id', deleteSalesRoute);

// Employee Route Assignment
router.get('/employee-routes', getEmployeeRoutes);
router.post('/employee-routes', assignEmployeeRoute);

export default router;
