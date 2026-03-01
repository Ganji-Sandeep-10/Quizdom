import { redis } from "../../lib/redis";
import {
    playersKey,
    disconnectedKey,
} from "../../modules/session/session.redis";

export const handleDisconnect = async (
    sessionId: string,
    userId: string
) => {
    await redis.set(disconnectedKey(sessionId, userId), "1", "EX", 20);

    setTimeout(async () => {
        const stillDisconnected = await redis.exists(
            disconnectedKey(sessionId, userId)
        );

        if (stillDisconnected) {
            await redis.srem(playersKey(sessionId), userId);
        }
    }, 20000);
};