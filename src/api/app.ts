import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import quizRoutes from "./modules/quiz/quiz.routes";
import sessionRoutes from "./modules/session/session.routes";


export const app = express();

app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/sessions", sessionRoutes);
