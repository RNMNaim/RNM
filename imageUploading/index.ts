import { hostname } from "os";
import { Job, Queue, QueueEvents } from "bullmq";

import IORedis from "ioredis";

const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
});

const ID = hostname();

const queue = new Queue("imageProcessing", {
    connection,
    defaultJobOptions: {
        attempts: 2,
    },
});

const queueEvents = new QueueEvents("imageProcessing", {
    connection,
});

queueEvents.on("completed", async (jobId) => {
    console.log("#######", jobId);
    const job = await queue.getJob(jobId as any);
    if (!job || job.returnvalue.parentId != ID) return;
    console.log("Job completed", job.returnvalue);
});

const server = Bun.serve({
    port: 4000,
    maxRequestBodySize: 5 * 1024 * 1024,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method != "POST")
            return new Response("Not Found", { status: 404 });

        // the path must be /upload/:token extract token from url
        if (url.pathname.startsWith("/upload/")) {
            const token = url.pathname.replace("/upload/", "");

            // parse formdata at /action
            const formdata = await req.formData();
            const picture = formdata.get("profilePicture");
            if (!picture) throw new Error("Must a file");
            // write profilePicture to disk

            const path = `/tmp/${token}.png`;
            await Bun.write(path, picture as any, {
                createPath: true,
            });

            await queue.add(token, {
                path: `${token}.png`,
                parentId: ID,
            });

            return new Response("Success");
        }

        return new Response("Not Found", { status: 404 });
    },
});

const fileServe = Bun.serve({
    port: 3333,
    async fetch(req) {
        const path = new URL(req.url).pathname; // todo a huge security issue here!
        const file = Bun.file("/tmp/" + path);
        return new Response(file);
    },
});
