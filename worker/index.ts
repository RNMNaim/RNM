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

new Worker(
  "imageProcessing",
  async (task: IJob) => {
    const imagePath = "./tmp/" + task.id;
    await Storage.downloadFile(task.data.parentId, task.data.path, imagePath);

    // get the image as image base64 link
    const image = await Bun.file(imagePath).text();
    const base64 = btoa(image);

    const response = AI.generateTextFromMultiData([base64]);

    await connection.hset(task.data.parentId, response);

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
