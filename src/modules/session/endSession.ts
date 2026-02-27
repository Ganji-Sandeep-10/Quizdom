import { redis } from "../../lib/redis";
import {
    sessionKey,
    leaderboardKey,
    playersKey,
} from "./session.redis";
import { prisma } from "../../lib/prisma";

export const endSession = async (sessionId: string) => {
    try {
        // Fetch full leaderboard
        const leaderboard = await redis.zrevrange(
            leaderboardKey(sessionId),
            0,
            -1,
            "WITHSCORES"
        );

        // Bulk create results (more efficient than loop)
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

        // Mark session ended
        await prisma.session.update({
            where: { id: sessionId },
            data: { endedAt: new Date() },
        });

        // Remove from active session set (IMPORTANT)
        await redis.srem("active_sessions", sessionId);

        // Cleanup Redis keys
        await redis.del(sessionKey(sessionId));
        await redis.del(playersKey(sessionId));
        await redis.del(leaderboardKey(sessionId));

    } catch (err) {
        console.error("End session error:", err);
        throw err;
    }
};