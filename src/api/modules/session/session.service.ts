import { redis } from "../../lib/redis";
import { prisma } from "../../lib/prisma";
import { leaderboardKey, playersKey, sessionKey } from "./session.redis";

export const getLeaderboardPaginated = async (
    sessionId: string,
    page: number,
    limit: number
) => {
    const start = page * limit;
    const end = start + limit - 1;

    return redis.zrevrange(
        leaderboardKey(sessionId),
        start,
        end,
        "WITHSCORES"
    );
};

export const getSessionState = async (sessionId: string) => {
    const [state, playerIds, rawLeaderboard] = await Promise.all([
        redis.hgetall(sessionKey(sessionId)),
        redis.smembers(playersKey(sessionId)),
        redis.zrevrange(leaderboardKey(sessionId), 0, -1, "WITHSCORES")
    ]);

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
            quiz: {
                select: {
                    _count: { select: { questions: true } }
                }
            }
        }
    });

    const playersWithNames = await prisma.user.findMany({
        where: { id: { in: playerIds } },
        select: { id: true, name: true }
    });

    const playerMap = new Map(playersWithNames.map(p => [p.id, p.name]));

    const leaderboard: any[] = [];
    for (let i = 0; i < rawLeaderboard.length; i += 2) {
        const playerId = rawLeaderboard[i];
        const score = parseInt(rawLeaderboard[i + 1]);
        leaderboard.push({
            playerId,
            playerName: playerMap.get(playerId) || "Unknown",
            score,
            rank: (i / 2) + 1
        });
    }

    const players = playerIds.map(id => ({
        id,
        name: playerMap.get(id) || "Unknown",
        score: leaderboard.find(l => l.playerId === id)?.score || 0,
        isConnected: true // simplified for now
    }));

    return {
        ...state,
        sessionId,
        currentQuestionIndex: parseInt(state.currentQuestionIndex || "-1"),
        totalQuestions: session?.quiz._count.questions || 0,
        players,
        leaderboard
    };
};