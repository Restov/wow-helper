import { cron } from "@elysia/cron";
import { Elysia } from "elysia";

import type { FetchWowHeadNewsJob } from "./jobs/fetch-wowhead-news";

export function createWorkerApp(
  wowHeadNewsJob: FetchWowHeadNewsJob,
  schedule: string,
) {
  return new Elysia()
    .use(
      cron({
        name: "wowHeadNews",
        pattern: schedule,
        run: () => wowHeadNewsJob.run(),
      }),
    )
    .get("/health", () => ({
      status: "ok",
      jobs: {
        wowHeadNews: wowHeadNewsJob.status,
      },
    }));
}
