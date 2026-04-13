import express from "express";
import {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    toggleTemplateStatus,
    deleteTemplate
} from "../controllers/templateController";

const router = express.Router();

router.get("/", getTemplates);
router.get("/:id", getTemplateById);
router.post("/", createTemplate);
router.put("/:id", updateTemplate);
router.patch("/:id/toggle", toggleTemplateStatus);
router.delete("/:id", deleteTemplate);

export default router;
