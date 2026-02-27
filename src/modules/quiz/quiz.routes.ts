import { Router } from "express";
import { createQuiz, getQuiz, addQuestion } from "./quiz.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { creatorOnly } from "../../middleware/creator.middleware";
import { validate } from "../../utils/validate";
import { createQuizSchema, createQuestionSchema } from "./quiz.schema";

const router = Router();

router.post("/", authMiddleware, validate(createQuizSchema), createQuiz);
router.get("/:quizId", getQuiz);

router.post(
    "/:quizId/question",
    authMiddleware,
    creatorOnly,
    validate(createQuestionSchema),
    addQuestion
);

export default router;