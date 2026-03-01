import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { sessionKey } from "./session.redis";

import { endSession } from "./endSession";

export const startSession = async (req: any, res: any) => {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { quiz: true },
    });

    if (!session) return res.status(404).json({ message: "Not found" });

    if (session.quiz.creatorId !== req.user.id)
        return res.status(403).json({ message: "Not allowed" });

    await redis.hset(sessionKey(sessionId), {
        status: "LIVE",
    });

    await redis.sadd("active_sessions", sessionId);

    res.json({ message: "Session started" });
};

export const endSessionHandler = async (req: any, res: any) => {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { quiz: true },
    });

    if (!session) return res.status(404).json({ message: "Not found" });
    if (session.quiz.creatorId !== req.user.id)
        return res.status(403).json({ message: "Not allowed" });

    await endSession(sessionId);

    res.json({ message: "Session ended" });
};