import { redis } from "../../lib/redis";
import {
    sessionKey,
    leaderboardKey,
    playersKey,
    answeredKey,
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

        // Create final result objects
        const playersWithNames = await prisma.user.findMany({
            where: { id: { in: results.map(r => r.userId) } },
            select: { id: true, name: true }
        });
        const playerMap = new Map(playersWithNames.map(p => [p.id, p.name]));

        const finalLeaderboard = results.map((r: any, i: number) => ({
            playerId: r.userId,
            playerName: playerMap.get(r.userId) || "Unknown",
            score: r.score,
            rank: i + 1
        }));

        if (results.length) {
            await prisma.finalResult.createMany({
                data: results,
            });
        }

        const sessionWithQuiz = await prisma.session.update({
            where: { id: sessionId },
            data: { endedAt: new Date() },
            include: { quiz: { include: { questions: { select: { id: true } } } } }
        });

        await redis.srem("active_sessions", sessionId);

        await redis.hset(sessionKey(sessionId), {
            status: "ENDED",
        });

        return finalLeaderboard;

    } catch (err) {
        console.error("End session error:", err);
        throw err;
    }
};