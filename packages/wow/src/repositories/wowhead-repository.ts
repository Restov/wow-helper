import type { WowHeadRepositoryContract } from "../contracts/wowhead-repository";
import { WowHeadParser } from "../helpers/wowhead-parser";
import type {
  WowHeadNewsArticle,
  WowHeadNewsFeed,
  WowHeadNewsItem,
} from "../models/wowhead-news";

const WOWHEAD_ORIGIN = "https://www.wowhead.com";

const NEWS_FEED_PATHS: Record<WowHeadNewsFeed, string> = {
  all: "/news/rss/all",
  "classic-series": "/news/rss/classic-series",
  forever: "/forever/news/rss/forever",
};

export class WowHeadRepository implements WowHeadRepositoryContract {
  constructor(
    private readonly requestTimeoutMs = 15_000,
    private readonly parser = new WowHeadParser(),
  ) {}

  getForeverNews(signal?: AbortSignal): Promise<WowHeadNewsItem[]> {
    return this.getNews("forever", signal);
  }

  getClassicSeriesNews(signal?: AbortSignal): Promise<WowHeadNewsItem[]> {
    return this.getNews("classic-series", signal);
  }

  getAllNews(signal?: AbortSignal): Promise<WowHeadNewsItem[]> {
    return this.getNews("all", signal);
  }

  async getNews(
    feed: WowHeadNewsFeed,
    signal?: AbortSignal,
  ): Promise<WowHeadNewsItem[]> {
    const xml = await this.request(NEWS_FEED_PATHS[feed], "application/rss+xml", signal);
    return this.parser.parseNewsFeed(xml);
  }

  async getNewsArticle(
    url: string,
    signal?: AbortSignal,
  ): Promise<WowHeadNewsArticle> {
    const html = await this.getNewsArticleHtml(url, signal);
    return this.parser.parseNewsArticle(html, url);
  }

  async getNewsArticleHtml(
    url: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const articleUrl = new URL(url, WOWHEAD_ORIGIN);

    if (
      articleUrl.origin !== WOWHEAD_ORIGIN ||
      !/^\/(?:forever\/)?news(?:\/|=)/.test(articleUrl.pathname)
    ) {
      throw new Error(`Unsupported Wowhead news URL: ${articleUrl.toString()}`);
    }

    return this.request(articleUrl.toString(), "text/html", signal);
  }

  private async request(
    pathOrUrl: string,
    accept: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const url = new URL(pathOrUrl, WOWHEAD_ORIGIN);
    const timeoutSignal = AbortSignal.timeout(this.requestTimeoutMs);
    const requestSignal = signal
      ? AbortSignal.any([signal, timeoutSignal])
      : timeoutSignal;

    const response = await fetch(url, {
      headers: {
        accept,
        "user-agent": "wow-helper/0.1 (+https://github.com/Restov/wow-helper)",
      },
      redirect: "follow",
      signal: requestSignal,
    });

    if (!response.ok) {
      throw new Error(
        `Wowhead request failed with ${response.status} ${response.statusText}: ${url.toString()}`,
      );
    }

    return response.text();
  }
}
