import express from "express";
import { getHierarchy, getLevelHierarchy } from "../controllers/hierarchyController";

const router = express.Router();

router.get("/", getHierarchy);
router.get("/levels", getLevelHierarchy);

export default router;
