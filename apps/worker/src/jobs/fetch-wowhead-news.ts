import type { Logger } from "pino";

import type { WowHeadRepositoryContract } from "../../../../packages/wow/src/contracts/wowhead-repository";

export interface WowHeadNewsJobStatus {
  running: boolean;
  lastStartedAt: string | null;
  lastSucceededAt: string | null;
  lastError: string | null;
  lastFetchedCount: number | null;
}

export class FetchWowHeadNewsJob {
  private readonly state: WowHeadNewsJobStatus = {
    running: false,
    lastStartedAt: null,
    lastSucceededAt: null,
    lastError: null,
    lastFetchedCount: null,
  };

  constructor(
    private readonly repository: WowHeadRepositoryContract,
    private readonly logger: Logger,
  ) {}

  get status(): Readonly<WowHeadNewsJobStatus> {
    return { ...this.state };
  }

  async run(): Promise<void> {
    if (this.state.running) {
      this.logger.warn("Wowhead news fetch skipped because the previous run is active");
      return;
    }

    this.state.running = true;
    this.state.lastStartedAt = new Date().toISOString();
    const startedAt = performance.now();

    try {
      const news = await this.repository.getForeverNews();
      const newest = news[0];

      this.state.lastSucceededAt = new Date().toISOString();
      this.state.lastError = null;
      this.state.lastFetchedCount = news.length;

      this.logger.info(
        {
          count: news.length,
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          newestArticle: newest
            ? {
                externalId: newest.externalId,
                title: newest.title,
                url: newest.url,
                publishedAt: newest.publishedAt.toISOString(),
              }
            : null,
        },
        "Wowhead news fetched",
      );
    } catch (error) {
      this.state.lastError = error instanceof Error ? error.message : String(error);
      this.logger.error({ err: error }, "Wowhead news fetch failed");
    } finally {
      this.state.running = false;
    }
  }
}
