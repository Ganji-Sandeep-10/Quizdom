import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: any, next: any) => {
    const cookieToken = req.cookies?.quiz_token;
    const authHeader = req.headers.authorization;

    let token = cookieToken;
    if (!token && authHeader) {
        token = authHeader.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = { id: decoded.userId };
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};