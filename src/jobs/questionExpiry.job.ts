import { redis } from "../lib/redis";
import { sessionKey } from "../modules/session/session.redis";

export const checkQuestionExpiry = async (io: any) => {
    try {
        // Only iterate active sessions (O(N) safe)
        const sessions = await redis.smembers("active_sessions");

        if (!sessions.length) return;

        const now = Date.now();

        for (const id of sessions) {
            const key = sessionKey(id);

            const session = await redis.hgetall(key);
            if (!session || !session.currentQuestionId) continue;

            if (
                session.questionEndTime &&
                now > Number(session.questionEndTime)
            ) {
                // Clear question state
                await redis.hset(key, {
                    currentQuestionId: "",
                    questionStartTime: "",
                    questionEndTime: "",
                });

                // Notify all players in room
                io.to(key).emit("question_ended");
            }
        }
    } catch (err) {
        console.error("Question expiry job error:", err);
    }
};