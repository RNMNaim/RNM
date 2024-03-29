const fs = require("fs");

import { Worker } from "bullmq";
import IORedis from "ioredis";

import * as AI from "./repositories/ai";
import type { IJob } from "./types";
import { FOODS } from "./repositories/data";

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
            [`the above picture represent a item from this list ${FOODS}. your instruction is to return only one item from the list that represent 100% the picture, never return anything outside the given list of items. the answer is in french and from the given list
            `]
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
