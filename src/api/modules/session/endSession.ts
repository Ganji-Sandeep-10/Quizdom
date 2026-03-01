import { redis } from "../../lib/redis";
import {
    sessionKey,
    leaderboardKey,
    playersKey,
} from "./session.redis";
import { prisma } from "../../lib/prisma";

export const endSession = async (sessionId: string) => {
    try {
        const leaderboard = await redis.zrevrange(
            leaderboardKey(sessionId),
            0,
            -1,
            "WITHSCORES"
        );

        const results = [];

        for (let i = 0; i < leaderboard.length; i += 2) {
            results.push({
                sessionId,
                userId: leaderboard[i]!,
                score: Number(leaderboard[i + 1]),
            });
        }

        if (results.length) {
            await prisma.finalResult.createMany({
                data: results,
            });
        }

        await prisma.session.update({
            where: { id: sessionId },
            data: { endedAt: new Date() },
        });
        await redis.srem("active_sessions", sessionId);

        await redis.del(sessionKey(sessionId));
        await redis.del(playersKey(sessionId));
        await redis.del(leaderboardKey(sessionId));

    } catch (err) {
        console.error("End session error:", err);
        throw err;
    }
};