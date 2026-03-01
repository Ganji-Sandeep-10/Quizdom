import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createSession, getLeaderboard, getSessionsForQuiz, getSession } from "./session.controller";
import { startSession, endSessionHandler } from "./host.controller";

const router = Router();

router.post("/:quizId", authMiddleware, createSession);
router.get("/quiz/:quizId", authMiddleware, getSessionsForQuiz);
router.get("/:sessionId", authMiddleware, getSession);
router.post("/:sessionId/start", authMiddleware, startSession);
router.post("/:sessionId/end", authMiddleware, endSessionHandler);
router.get("/:sessionId/leaderboard", getLeaderboard);

export default router;