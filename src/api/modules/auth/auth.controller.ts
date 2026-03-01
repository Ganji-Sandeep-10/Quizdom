import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: any, res: any) => {
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { email, password: hashed, name },
    });

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );

    res.cookie('quiz_token', token, {
        httpOnly: true,
        secure: false, // Set to false for local dev
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name, avatarSeed: user.avatarSeed } });
};

export const login = async (req: any, res: any) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Account not found. Please register first." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );

    res.cookie('quiz_token', token, {
        httpOnly: true,
        secure: false, // Set to false for local dev
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name, avatarSeed: user.avatarSeed } });
};

export const me = async (req: any, res: any) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: { id: user.id, email: user.email, name: user.name, avatarSeed: user.avatarSeed } });
};

export const logout = async (req: any, res: any) => {
    res.clearCookie('quiz_token', {
        httpOnly: true,
        secure: false, // Set to false for local dev
        sameSite: 'lax',
        path: '/',
    });
    res.json({ message: "Logged out" });
};

export const getProfile = async (req: any, res: any) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            avatarSeed: true,
            createdAt: true,
            quizzes: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                    _count: {
                        select: { questions: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) 
    return res.status(404).json({
        success: false,
        message: null,
        error: "USER_NOT_FOUND" 
    });

    // Fetch participation history
    const participations = await prisma.finalResult.findMany({
        where: { userId },
        include: {
            session: {
                include: {
                    quiz: {
                        select: {
                            title: true,
                            id: true
                        }
                    }
                }
            }
        },
        orderBy: { session: { createdAt: 'desc' } }
    });

    res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarSeed: user.avatarSeed,
            createdAt: user.createdAt
        },
        quizzes: user.quizzes,
        participations: participations.map(p => ({
            id: p.id,
            score: p.score,
            quizTitle: p.session.quiz.title,
            quizId: p.session.quiz.id,
            playedAt: p.session.createdAt
        }))
    });
};

export const updateProfile = async (req: any, res: any) => {
    const { name, avatarSeed } = req.body;
    const userId = req.user.id;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(avatarSeed !== undefined && { avatarSeed }),
            },
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarSeed: user.avatarSeed
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};
