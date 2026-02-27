import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createSession } from "./session.controller";
import { startSession } from "./host.controller";
import { getLeaderboard } from "./session.controller";

const router = Router();

router.post("/:quizId", authMiddleware, createSession);
router.post("/:sessionId/start", authMiddleware, startSession);
router.get("/:sessionId/leaderboard", getLeaderboard);

export default router;