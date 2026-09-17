import type {
  WowHeadNewsArticle,
  WowHeadNewsFeed,
  WowHeadNewsItem,
} from "../models/wowhead-news";

export interface WowHeadRepositoryContract {
  getNews(
    feed: WowHeadNewsFeed,
    signal?: AbortSignal,
  ): Promise<WowHeadNewsItem[]>;
  getForeverNews(signal?: AbortSignal): Promise<WowHeadNewsItem[]>;
  getClassicSeriesNews(signal?: AbortSignal): Promise<WowHeadNewsItem[]>;
  getAllNews(signal?: AbortSignal): Promise<WowHeadNewsItem[]>;
  getNewsArticle(
    url: string,
    signal?: AbortSignal,
  ): Promise<WowHeadNewsArticle>;
  getNewsArticleHtml(url: string, signal?: AbortSignal): Promise<string>;
}
