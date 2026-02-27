import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { initRedisAdapter } from "./lib/redis";

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