export type WowHeadNewsFeed = "all" | "classic-series" | "forever";

export interface WowHeadNewsItem {
  externalId: string;
  title: string;
  url: string;
  category: string | null;
  publishedAt: Date;
  summaryHtml: string;
  contentHtml: string;
}

export interface WowHeadNewsArticle {
  externalId: string;
  title: string;
  url: string;
  category: string | null;
  keywords: string[];
  author: string | null;
  publishedAt: Date;
  modifiedAt: Date | null;
  description: string | null;
  imageUrl: string | null;
  contentMarkup: string;
}
