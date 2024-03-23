import { Elysia } from "elysia";

const app = new Elysia()
  .get("/token/:token", async () => {
    return {
      label: "Hello World",
    };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
