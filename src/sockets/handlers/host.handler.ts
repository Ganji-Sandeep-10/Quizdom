import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { sessionKey, answeredKey } from "../../modules/session/session.redis";

export const handleStartQuestion = async (
    io: any,
    socket: any,
    payload: any
) => {
    const { sessionId, questionId, duration } = payload;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { quiz: true },
    });

    if (!session) return;

    // Verify host identity
    if (session.quiz.creatorId !== payload.userId) return;

    const now = Date.now();
    const end = now + duration * 1000;

    await redis.hset(sessionKey(sessionId), {
        currentQuestionId: questionId,
        questionStartTime: now,
        questionEndTime: end,
    });

    await redis.del(answeredKey(sessionId, questionId));

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true },
    });

    io.to(sessionKey(sessionId)).emit("question_started", {
        question,
        endTime: end,
    });
};