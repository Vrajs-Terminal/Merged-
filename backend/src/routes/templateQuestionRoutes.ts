import express from "express";
import {
    getQuestionsByTemplate,
    createQuestion,
    updateQuestion,
    deleteQuestion
} from "../controllers/templateQuestionController";

const router = express.Router();

router.get("/template/:templateId", getQuestionsByTemplate);
router.post("/", createQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
