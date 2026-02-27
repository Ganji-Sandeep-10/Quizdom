import { redis } from "../../lib/redis";
import {
    sessionKey,
    answeredKey,
    leaderboardKey,
} from "../../modules/session/session.redis";
import { prisma } from "../../lib/prisma";

export const handleAnswer = async (io: any, socket: any, payload: any) => {
    const { sessionId, userId, optionId } = payload;

    const session = await redis.hgetall(sessionKey(sessionId));
    if (session.status !== "LIVE") return;

    const qId = session.currentQuestionId;

    const already = await redis.sismember(
        answeredKey(sessionId, qId),
        userId
    );

    if (already) return;

    const question = await prisma.question.findUnique({
        where: { id: qId },
    });

    let score = 0;
    if (question?.correctId === optionId) score = 100;

    await redis.zincrby(leaderboardKey(sessionId), score, userId);
    await redis.sadd(answeredKey(sessionId, qId), userId);

    const leaderboard = await redis.zrevrange(
        leaderboardKey(sessionId),
        0,
        -1,
        "WITHSCORES"
    );

    io.to(sessionKey(sessionId)).emit("leaderboard", leaderboard);
};