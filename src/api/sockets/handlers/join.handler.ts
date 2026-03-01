import { redis } from "../../lib/redis";
import {
    sessionKey,
    playersKey,
    leaderboardKey,
    socketKey,
    disconnectedKey,
} from "../../modules/session/session.redis";
import { randomUUID } from "crypto";

import { getSessionState } from "../../modules/session/session.service";

export const handleJoin = async (io: any, socket: any, payload: any) => {
    const { sessionId } = payload;
    // Enforce authenticated id from socket middleware
    const userId: string | undefined = socket.data.userId;

    if (!userId) {
        socket.emit("error", "Authentication required to join session");
        return;
    }

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

    // Get comprehensive state
    const state = await getSessionState(sessionId);

    // Broadcast state to room so host gets updates
    io.to(sessionKey(sessionId)).emit("session_state", state);

    socket.emit("joined", { playerId: userId });
};