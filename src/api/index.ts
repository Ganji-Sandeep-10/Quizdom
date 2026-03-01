import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { initRedisAdapter } from "./lib/redis";
import { handleJoin } from "./sockets/handlers/join.handler";
import { handleAnswer } from "./sockets/handlers/answer.handler";
import { handleStartQuestion, handleNextQuestion, handleHostJoin } from "./sockets/handlers/host.handler";
import { checkQuestionExpiry } from "./jobs/questionExpiry.job";
import { prisma } from "./lib/prisma";
import { redisPub, redisSub } from "./lib/redis";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true,
    },
});

// parse cookie & attach userId to socket.data if token is present
import jwt from "jsonwebtoken";
import cookie from "cookie";

io.use((socket, next) => {
    const raw = socket.handshake.headers.cookie;
    if (raw) {
        const parsed = cookie.parse(raw);
        const token = parsed.quiz_token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
                socket.data.userId = decoded.userId;
            } catch (e) {
                // invalid token – ignore
            }
        }
    }
    next();
});

(async () => {
    await initRedisAdapter(io);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", async (payload: any) => {
        await handleJoin(io, socket, payload);
    });

    socket.on("host_join", async (payload: any) => {
        await handleHostJoin(io, socket, payload);
    });

    socket.on("answer", async (payload: any) => {
        await handleAnswer(io, socket, payload);
    });

    socket.on("start_question", async (payload: any) => {
        await handleStartQuestion(io, socket, payload);
    });

    socket.on("next_question", async (payload: any) => {
        await handleNextQuestion(io, socket, payload);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

const expiryInterval = setInterval(() => {
    checkQuestionExpiry(io);
}, 2000);


const shutdown = async () => {
    console.log("Graceful shutdown initiated...");

    try {
        // Stop background job
        clearInterval(expiryInterval);

        // Stop accepting new HTTP connections
        server.close(() => {
            console.log("HTTP server closed");
        });

        // Close Socket.IO
        io.close(() => {
            console.log("Socket.IO server closed");
        });

        // Close Prisma
        await prisma.$disconnect();
        console.log("Prisma disconnected");

        // Close Redis connections
        await redisPub.quit();
        await redisSub.quit();
        console.log("Redis connections closed");

        process.exit(0);
    } catch (err) {
        console.error("Shutdown error:", err);
        process.exit(1);
    }
};

// Handle termination signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("DATABASE_URL:", process.env.DATABASE_URL);