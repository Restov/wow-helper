import { openapi } from "@elysia/openapi";
import { Elysia } from "elysia";

import { requestLogger } from "./logger";

export function createApp() {
  return new Elysia()
    .use(requestLogger)
    .get("/health", () => ({ status: "ok" }))
    .use(openapi());
}
