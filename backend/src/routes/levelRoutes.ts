import express from "express";
import {
    getLevels,
    createLevel,
    updateLevel,
    deleteLevel,
    assignLevel,
    getEmployeeLevelHistory,
    getLevelHierarchy
} from "../controllers/levelController";

const router = express.Router();

router.get("/hierarchy", getLevelHierarchy);
router.get("/:id/history", getEmployeeLevelHistory);
router.post("/assign", assignLevel);

router.get("/", getLevels);
router.post("/", createLevel);
router.put("/:id", updateLevel);
router.delete("/:id", deleteLevel);

export default router;
