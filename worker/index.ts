const fs = require("fs");

import { Worker } from "bullmq";
import IORedis from "ioredis";

import * as AI from "./repositories/ai";
import type { IJob } from "./types";

const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
});

const worker = new Worker(
    "imageProcessing",
    async (task: IJob) => {
        console.log(`http://${task.data.parentId}:3333/${task.data.path}`);
        const response = await fetch(
            `http://${task.data.parentId}:3333/${task.data.path}`
        );
        const fileBuffer = await response.arrayBuffer();
        const base64String = Buffer.from(fileBuffer).toString("base64");

        const text = await AI.generateTextFromMultiData(
            [base64String],
            [
                "give me the name of the food or item be precise and return only one word, when i search with that name the above picture appeas. again only one word and when it's extremly urgent give me second name",
            ]
        );

        console.log(text, task.name);
        await connection.hset("results", task.name, text);

        await new Promise((res) => setTimeout(res, 1000));
        return task.data;
    },
    {
        connection,
        concurrency: 1,
        limiter: {
            max: 30,
            duration: 60 * 1000,
        },
    }
);

worker.on("ready", () => {
    console.log("Worker(" + worker.name + ") is active id=" + worker.id);
});
