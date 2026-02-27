import { z } from "zod";

export const createQuizSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
});

export const createQuestionSchema = z.object({
    text: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    correctIndex: z.number(),
});