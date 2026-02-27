import { prisma } from "../../lib/prisma";
import { createSessionState } from "./session.redis";
import { getLeaderboardPaginated } from "./session.service";

export const createSession = async (req: any, res: any) => {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.creatorId !== req.user.id)
        return res.status(403).json({ message: "Not allowed" });

    const session = await prisma.session.create({
        data: { quizId },
    });

    await createSessionState(session.id);

    res.json(session);
};

export const getLeaderboard = async (req: any, res: any) => {
    const { sessionId } = req.params;

    const page = Number(req.query.page ?? 0);
    const limit = Number(req.query.limit ?? 20);

    if (page < 0 || limit <= 0 || limit > 100) {
        return res.status(400).json({ message: "Invalid pagination" });
    }

    const leaderboard = await getLeaderboardPaginated(
        sessionId,
        page,
        limit
    );

    res.json(leaderboard);
};