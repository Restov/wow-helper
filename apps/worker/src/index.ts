import { WowHeadRepository } from "../../../packages/wow/src/repositories/wowhead-repository";
import { createWorkerApp } from "./app";
import { FetchWowHeadNewsJob } from "./jobs/fetch-wowhead-news";
import { logger } from "./logger";

const port = Number(Bun.env.PORT ?? 3001);
const hostname = Bun.env.HOST ?? "0.0.0.0";
const schedule = Bun.env.WOWHEAD_POLL_CRON ?? "0 */5 * * * *";

const wowHeadNewsJob = new FetchWowHeadNewsJob(
  new WowHeadRepository(),
  logger,
);

const app = createWorkerApp(wowHeadNewsJob, schedule).listen({ hostname, port });

logger.info(
  {
    hostname: app.server?.hostname,
    port: app.server?.port,
    wowHeadPollSchedule: schedule,
  },
  "Worker started",
);

void wowHeadNewsJob.run();

async function shutdown(signal: string) {
  logger.info({ signal }, "Worker stopping");
  app.store.cron.wowHeadNews.stop();
  await app.stop();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
