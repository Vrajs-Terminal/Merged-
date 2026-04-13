import { Router } from "express";
import { login, me, register } from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", authenticateToken, me);

export default router;
