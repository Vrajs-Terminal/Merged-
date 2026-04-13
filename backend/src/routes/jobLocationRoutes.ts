import express from 'express';
import {
  getAllJobLocations,
  getJobLocation,
  createJobLocation,
  updateJobLocation,
  deleteJobLocation
} from '../controllers/jobLocationController';

const router = express.Router();

router.get('/', getAllJobLocations);
router.get('/employee/:employeeId', getJobLocation);
router.post('/', createJobLocation);
router.put('/:employeeId', updateJobLocation);
router.delete('/:employeeId', deleteJobLocation);

export default router;
