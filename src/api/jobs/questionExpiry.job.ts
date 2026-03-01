import { redis } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { sessionKey } from "../modules/session/session.redis";

export const checkQuestionExpiry = async (io: any) => {
    try {
        // Only iterate active sessions (O(N) safe)
        const sessions = await redis.smembers("active_sessions");

        if (!sessions.length) return;

        const now = Date.now();

        for (const id of sessions) {
            const key = sessionKey(id);

            const session = await redis.hgetall(key);
            if (!session || !session.currentQuestionId) continue;

            const questionEndTime = session.questionEndTime ? Number(session.questionEndTime) : 0;

            if (questionEndTime > 0 && now > questionEndTime) {
                // Fetch question details for feedback
                const qId = session.currentQuestionId;
                const dbSession = await prisma.session.findUnique({
                    where: { id },
                    include: { quiz: { include: { questions: { include: { options: true } } } } }
                });

                if (dbSession) {
                    const qIndex = dbSession.quiz.questions.findIndex((q: any) => q.id === qId);
                    const question = dbSession.quiz.questions[qIndex];
                    if (!question) continue;

                    const correctOptionIndex = question.options.findIndex((o: any) => o.id === question.correctId);

                    // Clear question state
                    await redis.hset(key, {
                        currentQuestionId: "",
                        questionStartTime: "",
                        questionEndTime: "",
                    });

                    // Notify all players in room with results
                    io.to(key).emit("question_ended", {
                        questionIndex: qIndex,
                        correctOptionIndex
                    });
                }
            }
        }
    } catch (err) {
        console.error("Question expiry job error:", err);
    }
};