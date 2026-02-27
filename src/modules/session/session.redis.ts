import { redis } from "../../lib/redis";

export const sessionKey = (id: string) => `session:${id}`;
export const playersKey = (id: string) => `session:${id}:players`;
export const leaderboardKey = (id: string) => `session:${id}:leaderboard`;
export const answeredKey = (id: string, qId: string) =>
    `session:${id}:question:${qId}:answered`;
export const socketKey = (id: string, userId: string) =>
    `session:${id}:socket:${userId}`;
export const disconnectedKey = (id: string, userId: string) =>
    `session:${id}:disconnected:${userId}`;

export const createSessionState = async (sessionId: string) => {
    await redis.hset(sessionKey(sessionId), {
        status: "WAITING",
        currentQuestionId: "",
        questionStartTime: "",
        questionEndTime: "",
    });
};