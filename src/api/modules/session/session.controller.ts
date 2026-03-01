import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
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

    res.json({ session });
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

export const getSessionsForQuiz = async (req: any, res: any) => {
    const { quizId } = req.params;
    const sessions = await prisma.session.findMany({
        where: { quizId },
        orderBy: { createdAt: "desc" },
    });
    res.json({ sessions });
};

export const getSession = async (req: any, res: any) => {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { quiz: { include: { questions: true } } },
    });

    if (!session) return res.status(404).json({ message: "Session not found" });

    const state = await redis.hgetall(`session:${sessionId}`);

    res.json({
        session: {
            ...session,
            status: state.status || "WAITING",
            players: [],
            currentQuestionIndex: -1,
            totalQuestions: session.quiz.questions.length
        }
    });
};