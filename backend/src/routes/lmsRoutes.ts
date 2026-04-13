import express from "express";
import {
  createLmsCourse,
  createLmsProgress,
  deleteLmsCourse,
  getLmsCourses,
  getLmsReport,
  updateLmsCourse,
} from "../controllers/lmsController";

const router = express.Router();

router.get("/courses", getLmsCourses);
router.post("/courses", createLmsCourse);
router.put("/courses/:id", updateLmsCourse);
router.delete("/courses/:id", deleteLmsCourse);

router.get("/report", getLmsReport);
router.post("/progress", createLmsProgress);

export default router;
