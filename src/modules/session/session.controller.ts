import { prisma } from "../../lib/prisma";
import { createSessionState } from "./session.redis";

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