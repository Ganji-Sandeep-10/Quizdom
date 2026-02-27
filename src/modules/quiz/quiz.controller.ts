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

    res.json(quiz);
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

    res.json(quiz);
};

export const addQuestion = async (req: any, res: any) => {
    const { text, options, correctIndex } = req.body;
    const { quizId } = req.params;

    const question = await prisma.question.create({
        data: {
            text,
            quizId,
            correctId: "", // temp
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