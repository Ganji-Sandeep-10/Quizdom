import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { submitAnswerAtomic } from "../../lib/redisScripts";
import {
    sessionKey,
    answeredKey,
    leaderboardKey,
    rateKey,
} from "../../modules/session/session.redis";

export const handleAnswer = async (io: any, socket: any, payload: any) => {
    try {
        const { sessionId, userId, optionId } = payload;

        if (!sessionId || !userId || !optionId) return;

        // Fetch session state
        const session = await redis.hgetall(sessionKey(sessionId));
        if (!session || session.status !== "LIVE") return;

        const qId = session.currentQuestionId;
        if (!qId) return;

        // Validate question time
        const now = Date.now();
        if (!session.questionEndTime || now > Number(session.questionEndTime)) {
            return; // Question expired
        }

        // Rate limiting (anti-spam)
        const count = await redis.incr(rateKey(sessionId, userId));

        if (count === 1) {
            await redis.expire(rateKey(sessionId, userId), 2);
        }

        if (count > 5) {
            return; // Spam blocked
        }

        // Fetch correct answer from DB
        const question = await prisma.question.findUnique({
            where: { id: qId },
            select: { correctId: true },
        });

        if (!question) return;

        // Calculate score
        let score = 0;
        if (question.correctId === optionId) {
            score = 100;
        }

        // Atomic Redis scoring (Lua)
        const result = await submitAnswerAtomic(
            answeredKey(sessionId, qId),
            leaderboardKey(sessionId),
            userId,
            score
        );

        // If already answered → do nothing
        if (Number(result) === 0) return;

        // Fetch top 20 leaderboard
        const leaderboard = await redis.zrevrange(
            leaderboardKey(sessionId),
            0,
            19,
            "WITHSCORES"
        );

        // Broadcast update
        io.to(sessionKey(sessionId)).emit("leaderboard", leaderboard);
    } catch (err) {
        console.error("Answer handler error:", err);
    }
};