const fs = require("fs");

import { Worker } from "bullmq";
import IORedis from "ioredis";

import * as Storage from "./repositories/storage";
import * as AI from "./repositories/ai";
import type { IJob } from "./types";

const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "imageProcessing",
  async (task: IJob) => {
    const imagePath = "./tmp/" + task.id;
    await Storage.downloadFile(task.data.parentId, task.data.path, imagePath);

    const fileBuffer = fs.readFileSync(imagePath); // todo make it async
    const base64String = fileBuffer.toString("base64");

    const text = await AI.generateTextFromMultiData(
      [base64String],
      [
        "give me the name of the food or item be precise and return only one word",
      ]
    );

    await connection.hset("results", task.data.parentId, text);

    await new Promise((res) => setTimeout(res, 1000));
    return task.data;
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 30,
      duration: 60 * 1000,
    },
  }
);

worker.on("ready", () => {
  console.log("Worker(" + worker.name + ") is active id=" + worker.id);
});
