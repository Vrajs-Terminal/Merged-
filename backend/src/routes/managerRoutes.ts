import express from "express";
import {
    getManagers,
    createManager,
    updateManager,
    deleteManager,
    assignEmployees
} from "../controllers/managerController";

const router = express.Router();

router.get("/", getManagers);
router.post("/", createManager);
router.put("/:id", updateManager);
router.delete("/:id", deleteManager);
router.post("/assign", assignEmployees);

export default router;
