import { redis } from "../../lib/redis";
import { leaderboardKey } from "./session.redis";

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