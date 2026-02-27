import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";

const pubClient = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
});

const subClient = pubClient.duplicate();

export const redis = pubClient;
export const redisPub = pubClient;
export const redisSub = subClient;

export const initRedisAdapter = async (io: Server) => {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
};