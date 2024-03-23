import type { Job } from "bullmq";

export type IJob = Job<{
  path: string;
  parentId: string;
}>;
