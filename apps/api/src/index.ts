import { Elysia } from "elysia";
import { openapi } from '@elysia/openapi'

const port = Number(Bun.env.PORT ?? 3000);

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .use(openapi())
  .listen(port);

console.log(`API is running at http://${app.server?.hostname}:${app.server?.port}`);
