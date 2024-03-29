import { Elysia } from "elysia";
import IORedis from "ioredis";

const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
});

const app = new Elysia()
    .get("/token/:token", async (req) => {
        return {
            label: await connection.hget("results", req.params.token),
        };
    })
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
