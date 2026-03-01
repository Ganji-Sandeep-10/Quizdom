import { prisma } from "../../lib/prisma";

export const createQuiz = async (req: any, res: any) => {
    const { title, description } = req.body;

    const quiz = await prisma.quiz.create({
        data: {
            title,
            description,
            creatorId: req.user.id,
        },
    });

    res.json({ quiz });
};

export const getQuizzes = async (req: any, res: any) => {
    const quizzes = await prisma.quiz.findMany({
        where: { creatorId: req.user.id },
        include: { questions: true },
        orderBy: { createdAt: "desc" }
    });
    res.json({ quizzes });
};

export const getQuiz = async (req: any, res: any) => {
    const quiz = await prisma.quiz.findUnique({
        where: { id: req.params.quizId },
        include: {
            questions: {
                include: { options: true },
            },
        },
    });

    if (!quiz) return res.status(404).json({ message: "Not found" });

    res.json({ quiz });
};

export const addQuestion = async (req: any, res: any) => {
    const { text, options, correctIndex } = req.body;
    const { quizId } = req.params;

    const question = await prisma.question.create({
        data: {
            text,
            quizId,
            correctId: "temp-id-to-be-updated",
        },
    });

    const createdOptions = await Promise.all(
        options.map((opt: string) =>
            prisma.option.create({
                data: {
                    text: opt,
                    questionId: question.id,
                },
            })
        )
    );

    await prisma.question.update({
        where: { id: question.id },
        data: {
            correctId: createdOptions[correctIndex].id,
        },
    });

    res.json({ message: "Question added" });
};

export const deleteQuiz = async (req: any, res: any) => {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
    });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.creatorId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    try {
        await prisma.quiz.delete({
            where: { id: quizId },
        });
        res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
        console.error("Failed to delete quiz:", error);
        res.status(500).json({ message: "Failed to delete quiz" });
    }
};

export const deleteQuestion = async (req: any, res: any) => {
    const { quizId, questionId } = req.params;

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
    });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.creatorId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    try {
        await prisma.option.deleteMany({
            where: { questionId },
        });

        await prisma.question.delete({
            where: { id: questionId },
        });
        res.json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("Failed to delete question:", error);
        res.status(500).json({ message: "Failed to delete question" });
    }
};

export const updateQuestion = async (req: any, res: any) => {
    const { text, options, correctIndex } = req.body;
    const { quizId, questionId } = req.params;

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
    });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.creatorId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    try {
        // Delete old options
        await prisma.option.deleteMany({
            where: { questionId },
        });

        // Update question text and temporary correctId
        await prisma.question.update({
            where: { id: questionId },
            data: {
                text,
                correctId: "temp-id-to-be-updated",
            },
        });

        // Recreate options
        const createdOptions = await Promise.all(
            options.map((opt: string) =>
                prisma.option.create({
                    data: {
                        text: opt,
                        questionId,
                    },
                })
            )
        );

        // Update the question's correctId to point to the newly created option
        await prisma.question.update({
            where: { id: questionId },
            data: {
                correctId: createdOptions[correctIndex].id,
            },
        });

        res.json({ message: "Question updated successfully" });
    } catch (error) {
        console.error("Failed to update question:", error);
        res.status(500).json({ message: "Failed to update question" });
    }
};
