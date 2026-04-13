import express from "express";
import { 
    getTasks, createTask, updateTask, deleteTask,
    getTaskCategories, createTaskCategory,
    getTaskPriorities, createTaskPriority
} from "../controllers/taskController";

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

router.get("/categories", getTaskCategories);
router.post("/categories", createTaskCategory);

router.get("/priorities", getTaskPriorities);
router.post("/priorities", createTaskPriority);

export default router;
