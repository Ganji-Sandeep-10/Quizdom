import { redis } from "../../lib/redis";
import {
    sessionKey,
    playersKey,
    leaderboardKey,
    socketKey,
    disconnectedKey,
} from "../../modules/session/session.redis";

export const handleJoin = async (io: any, socket: any, payload: any) => {
    const { sessionId, userId } = payload;

    const exists = await redis.exists(sessionKey(sessionId));
    if (!exists) {
        socket.emit("error", "Session not found");
        return;
    }

    const isPlayer = await redis.sismember(playersKey(sessionId), userId);

    if (isPlayer) {
        // reconnect
        await redis.set(socketKey(sessionId, userId), socket.id);
        await redis.del(disconnectedKey(sessionId, userId));
    } else {
        await redis.sadd(playersKey(sessionId), userId);
        await redis.zadd(leaderboardKey(sessionId), 0, userId);
        await redis.set(socketKey(sessionId, userId), socket.id);
    }

    socket.join(sessionKey(sessionId));

    const state = await redis.hgetall(sessionKey(sessionId));
    const leaderboard = await redis.zrevrange(
        leaderboardKey(sessionId),
        0,
        -1,
        "WITHSCORES"
    );

    socket.emit("session_state", state);
    socket.emit("leaderboard", leaderboard);
};