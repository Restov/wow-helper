import { createApp } from "./app";
import { logger } from "./logger";

const port = Number(Bun.env.PORT ?? 3000);
const hostname = Bun.env.HOST ?? "0.0.0.0";

const app = createApp().listen({ hostname, port });

logger.info(
  {
    hostname: app.server?.hostname,
    port: app.server?.port,
  },
  "API started",
);
