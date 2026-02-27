import { redis } from "../../lib/redis";
import {
    sessionKey,
    leaderboardKey,
    playersKey,
} from "./session.redis";
import { prisma } from "../../lib/prisma";

export const endSession = async (sessionId: string) => {
    const leaderboard = await redis.zrevrange(
        leaderboardKey(sessionId),
        0,
        -1,
        "WITHSCORES"
    );

    for (let i = 0; i < leaderboard.length; i += 2) {
        await prisma.finalResult.create({
            data: {
                sessionId,
                userId: leaderboard[i],
                score: Number(leaderboard[i + 1]),
            },
        });
    }

    await prisma.session.update({
        where: { id: sessionId },
        data: { endedAt: new Date() },
    });

    await redis.del(sessionKey(sessionId));
    await redis.del(playersKey(sessionId));
    await redis.del(leaderboardKey(sessionId));
};