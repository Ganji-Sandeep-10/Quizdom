import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createSession } from "./session.controller";

const router = Router();

router.post("/:quizId", authMiddleware, createSession);

export default router;