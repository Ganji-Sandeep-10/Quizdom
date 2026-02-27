import { prisma } from "../lib/prisma";

export const creatorOnly = async (req: any, res: any, next: any) => {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
    });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.creatorId !== req.user.id)
        return res.status(403).json({ message: "Not allowed" });

    next();
};