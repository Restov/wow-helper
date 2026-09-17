import { XMLParser } from "fast-xml-parser";

import type {
  WowHeadNewsArticle,
  WowHeadNewsItem,
} from "../models/wowhead-news";

const WOWHEAD_ORIGIN = "https://www.wowhead.com";

interface RawNewsItem {
  title?: string;
  link?: string;
  description?: string;
  category?: string | string[];
  pubDate?: string;
  guid?: string;
  encoded?: string;
}

interface ParsedRssFeed {
  rss?: {
    channel?: {
      item?: RawNewsItem | RawNewsItem[];
    };
  };
}

interface NewsArticleJsonLd {
  "@type"?: string | string[];
  headline?: string;
  url?: string;
  articleSection?: string;
  keywords?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: string | { name?: string } | Array<{ name?: string }>;
  description?: string;
  image?: string | { url?: string } | Array<string | { url?: string }>;
}

export class WowHeadParser {
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    processEntities: false,
    removeNSPrefix: true,
    trimValues: true,
  });

  parseNewsFeed(xml: string): WowHeadNewsItem[] {
    const parsed = this.xmlParser.parse(xml) as ParsedRssFeed;
    const rawItems = parsed.rss?.channel?.item;

    if (!rawItems) {
      return [];
    }

    const items = Array.isArray(rawItems) ? rawItems : [rawItems];
    return items.map((item) => this.parseNewsItem(item));
  }

  parseNewsArticle(html: string, sourceUrl: string): WowHeadNewsArticle {
    const metadata = this.extractNewsArticleMetadata(html);
    const url = metadata.url ?? sourceUrl;
    const externalId = this.extractNewsId(url);
    const publishedAt = this.parseDate(metadata.datePublished, "datePublished");

    return {
      externalId,
      title: requireString(metadata.headline, "headline"),
      url: normalizeNewsUrl(url, externalId),
      category: metadata.articleSection ?? null,
      keywords: parseKeywords(metadata.keywords),
      author: parseAuthor(metadata.author),
      publishedAt,
      modifiedAt: metadata.dateModified
        ? this.parseDate(metadata.dateModified, "dateModified")
        : null,
      description: metadata.description ?? null,
      imageUrl: parseImageUrl(metadata.image),
      contentMarkup: this.extractArticleMarkup(html),
    };
  }

  extractNewsId(value: string): string {
    const match = value.match(/news=(\d+)/) ?? value.match(/-(\d+)(?:[/?#]|$)/);

    if (!match?.[1]) {
      throw new Error(`Unable to extract Wowhead news ID from: ${value}`);
    }

    return match[1];
  }

  private parseNewsItem(item: RawNewsItem): WowHeadNewsItem {
    const sourceId = item.guid ?? item.link;
    const externalId = this.extractNewsId(
      requireString(sourceId, "guid or link"),
    );

    return {
      externalId,
      title: requireString(item.title, "title"),
      url: normalizeNewsUrl(requireString(item.link, "link"), externalId),
      category: getCategory(item.category),
      publishedAt: this.parseDate(item.pubDate, "pubDate"),
      summaryHtml: item.description ?? "",
      contentHtml: item.encoded ?? "",
    };
  }

  private extractNewsArticleMetadata(html: string): NewsArticleJsonLd {
    const scripts = html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    );

    for (const match of scripts) {
      if (!match[1]) {
        continue;
      }

      const parsed = JSON.parse(match[1]) as NewsArticleJsonLd;
      const types = Array.isArray(parsed["@type"])
        ? parsed["@type"]
        : [parsed["@type"]];

      if (types.includes("NewsArticle")) {
        return parsed;
      }
    }

    throw new Error("Wowhead article does not contain NewsArticle metadata");
  }

  private extractArticleMarkup(html: string): string {
    const match = html.match(
      /WH\.markup\.printHtml\(\s*("(?:\\.|[^"\\])*")/,
    );

    if (!match?.[1]) {
      throw new Error("Wowhead article content was not found");
    }

    return JSON.parse(match[1]) as string;
  }

  private parseDate(value: string | undefined, field: string): Date {
    const date = new Date(requireString(value, field));

    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid Wowhead ${field}: ${value}`);
    }

    return date;
  }
}

function normalizeNewsUrl(url: string, externalId: string): string {
  const parsed = new URL(url, WOWHEAD_ORIGIN);
  const legacyPath = parsed.pathname.match(
    /^\/(forever\/)?news=\d+\/([^/?#]+)\/?$/,
  );

  if (!legacyPath?.[2]) {
    return parsed.toString();
  }

  const section = legacyPath[1] ?? "";
  return `${WOWHEAD_ORIGIN}/${section}news/${legacyPath[2]}-${externalId}`;
}

function getCategory(category: string | string[] | undefined): string | null {
  if (Array.isArray(category)) {
    return category[0] ?? null;
  }

  return category ?? null;
}

function parseKeywords(keywords: string | string[] | undefined): string[] {
  if (Array.isArray(keywords)) {
    return keywords;
  }

  return keywords
    ? keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    : [];
}

function parseAuthor(author: NewsArticleJsonLd["author"]): string | null {
  if (typeof author === "string") {
    return author;
  }

  if (Array.isArray(author)) {
    return author.find((entry) => entry.name)?.name ?? null;
  }

  return author?.name ?? null;
}

function parseImageUrl(image: NewsArticleJsonLd["image"]): string | null {
  if (typeof image === "string") {
    return image;
  }

  if (Array.isArray(image)) {
    const first = image[0];
    return typeof first === "string" ? first : (first?.url ?? null);
  }

  return image?.url ?? null;
}

function requireString(value: string | undefined, field: string): string {
  if (!value) {
    throw new Error(`Wowhead content is missing ${field}`);
  }

  return value;
}
