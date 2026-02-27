import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { initRedisAdapter } from "./lib/redis";
import { handleJoin } from "./sockets/handlers/join.handler";
import { handleAnswer } from "./sockets/handlers/answer.handler";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

(async () => {
    await initRedisAdapter(io);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();


io.on("connection", (socket) => {
    socket.on("join", (payload) => handleJoin(io, socket, payload));

    socket.on("answer", (payload) =>
        handleAnswer(io, socket, payload)
    );
});