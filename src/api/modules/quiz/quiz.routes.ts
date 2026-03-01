import { Router } from "express";
import { createQuiz, getQuizzes, getQuiz, addQuestion, deleteQuiz, deleteQuestion, updateQuestion } from "./quiz.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { creatorOnly } from "../../middleware/creator.middleware";
import { validate } from "../../utils/validate";
import { createQuizSchema, createQuestionSchema } from "./quiz.schema";

const router = Router();

router.post("/", authMiddleware, validate(createQuizSchema), createQuiz);
router.get("/", authMiddleware, getQuizzes);
router.get("/:quizId", getQuiz);

router.post(
    "/:quizId/question",
    authMiddleware,
    creatorOnly,
    validate(createQuestionSchema),
    addQuestion
);

router.delete("/:quizId", authMiddleware, creatorOnly, deleteQuiz);
router.delete("/:quizId/question/:questionId", authMiddleware, creatorOnly, deleteQuestion);
router.put(
    "/:quizId/question/:questionId",
    authMiddleware,
    creatorOnly,
    validate(createQuestionSchema),
    updateQuestion
);

export default router;