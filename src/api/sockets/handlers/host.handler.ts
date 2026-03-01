import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { sessionKey, answeredKey } from "../../modules/session/session.redis";

export const handleStartQuestion = async (
    io: any,
    socket: any,
    payload: any
) => {
    const { sessionId, duration } = payload;
    let { questionId } = payload;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { quiz: { include: { questions: true } } },
    });

    if (!session) return;

    // Verify host identity
    const uid = socket?.data?.userId || payload.userId;
    if (session.quiz.creatorId !== uid) return;

    // If questionId is not provided, use the one from current index
    if (!questionId) {
        const state = await redis.hgetall(sessionKey(sessionId));
        const index = parseInt(state.currentQuestionIndex || "0");
        const question = session.quiz.questions[index];
        if (!question) return;
        questionId = question.id;
    }

    const now = Date.now();
    const end = now + (duration || 30) * 1000;

    const qIndex = session.quiz.questions.findIndex(q => q.id === questionId);

    await redis.hset(sessionKey(sessionId), {
        currentQuestionId: questionId,
        currentQuestionIndex: qIndex.toString(),
        questionStartTime: now,
        questionEndTime: end,
        status: "LIVE",
    });

    await redis.del(answeredKey(sessionId, questionId));

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true },
    });

    io.to(sessionKey(sessionId)).emit("question_started", {
        question: {
            ...question,
            index: session.quiz.questions.findIndex(q => q.id === questionId),
            endTime: end,
            totalQuestions: session.quiz.questions.length
        }
    });
};

export const handleNextQuestion = async (
    io: any,
    socket: any,
    payload: any
) => {
    const { sessionId } = payload;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { quiz: { include: { questions: true } } },
    });

    if (!session) return;

    const state = await redis.hgetall(sessionKey(sessionId));
    let currentIndex = state.currentQuestionIndex ? parseInt(state.currentQuestionIndex) : -1;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= session.quiz.questions.length) {
        // No more questions
        return;
    }

    await redis.hset(sessionKey(sessionId), {
        currentQuestionIndex: nextIndex.toString(),
    });

    // Start the next question
    await handleStartQuestion(io, socket, {
        sessionId,
        questionId: session.quiz.questions[nextIndex].id,
        duration: 30
    });
};