import type { StoryLanguage } from "../stories/types";

export interface ApiStorySummary {
  slug: string;
  title: string;
  tagline: string | null;
  author_display_name: string;
  language_code: StoryLanguage;
  genres: string[];
  episode_count: number;
}

export interface ApiStoryDetail extends ApiStorySummary {
  description: string | null;
  published_at: string | null;
}

export interface ApiStoryPage {
  items: ApiStorySummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiEpisodeSummary {
  episode_number: number;
  slug: string;
  title: string;
  language_code: StoryLanguage;
  is_free: boolean;
}

export interface ApiEpisodePage {
  story_slug: string;
  language_code: StoryLanguage;
  items: ApiEpisodeSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiEpisodeReading extends ApiEpisodeSummary {
  body_text: string;
}

export interface ApiEpisodeAudioMetadata {
  story_slug: string;
  episode_number: number;
  language_code: StoryLanguage;
  title: string;
  duration_ms: number;
  mime_type: string;
  narrator_name: string | null;
}

export interface ApiPagination {
  limit?: number;
  offset?: number;
}

export interface ApiStoryFilters extends ApiPagination {
  genre?: string;
}

export class StoryVerseApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);

    this.name = "StoryVerseApiError";
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 12000;

export function getStoryVerseApiBaseUrl(): string | null {
  const configured =
    process.env.EXPO_PUBLIC_STORYVERSE_API_URL?.trim();

  if (!configured) {
    return null;
  }

  if (!/^https?:\/\/[^/?#@]+\/?$/i.test(configured)) {
    throw new StoryVerseApiError(
      "Invalid StoryVerse API URL configuration."
    );
  }

  return configured.replace(/\/$/, "");
}

function requireApiBaseUrl(): string {
  const baseUrl = getStoryVerseApiBaseUrl();

  if (!baseUrl) {
    throw new StoryVerseApiError(
      "StoryVerse API URL is not configured."
    );
  }

  return baseUrl;
}

type QueryParameters = Record<
  string,
  string | number | undefined
>;

function buildQueryString(params: QueryParameters): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      return (
        `${encodeURIComponent(key)}=` +
        encodeURIComponent(String(value))
      );
    });

  return entries.length > 0
    ? `?${entries.join("&")}`
    : "";
}

function encodeStorySlug(slug: string): string {
  const normalized = slug.trim();

  if (!normalized) {
    throw new StoryVerseApiError("Story slug is required.");
  }

  return encodeURIComponent(normalized);
}

function validateEpisodeNumber(episodeNumber: number): void {
  if (
    !Number.isInteger(episodeNumber) ||
    episodeNumber < 1
  ) {
    throw new StoryVerseApiError(
      "Episode number must be a positive integer."
    );
  }
}

async function requestJson<T>(
  path: string,
  params: QueryParameters = {}
): Promise<T> {
  const baseUrl = requireApiBaseUrl();
  const query = buildQueryString(params);

  const url = `${baseUrl}/api/v1/${path}${query}`;

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new StoryVerseApiError(
        `StoryVerse request failed (HTTP ${response.status}).`,
        response.status
      );
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw new StoryVerseApiError(
        "StoryVerse API returned invalid JSON.",
        response.status
      );
    }

    if (
      payload === null ||
      typeof payload !== "object"
    ) {
      throw new StoryVerseApiError(
        "StoryVerse API returned an invalid response.",
        response.status
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof StoryVerseApiError) {
      throw error;
    }

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new StoryVerseApiError(
        "The StoryVerse request timed out."
      );
    }

    throw new StoryVerseApiError(
      "Unable to connect to the StoryVerse API."
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export function fetchPublishedStories(
  language: StoryLanguage = "en",
  filters: ApiStoryFilters = {}
): Promise<ApiStoryPage> {
  return requestJson<ApiStoryPage>("stories", {
    language,
    genre: filters.genre,
    limit: filters.limit,
    offset: filters.offset,
  });
}

export function fetchStoryDetails(
  slug: string,
  language: StoryLanguage = "en"
): Promise<ApiStoryDetail> {
  const encodedSlug = encodeStorySlug(slug);

  return requestJson<ApiStoryDetail>(
    `stories/${encodedSlug}`,
    { language }
  );
}

export function fetchPublishedEpisodes(
  slug: string,
  language: StoryLanguage = "en",
  pagination: ApiPagination = {}
): Promise<ApiEpisodePage> {
  const encodedSlug = encodeStorySlug(slug);

  return requestJson<ApiEpisodePage>(
    `stories/${encodedSlug}/episodes`,
    {
      language,
      limit: pagination.limit,
      offset: pagination.offset,
    }
  );
}

export function fetchEpisodeReading(
  slug: string,
  episodeNumber: number,
  language: StoryLanguage = "en"
): Promise<ApiEpisodeReading> {
  validateEpisodeNumber(episodeNumber);

  const encodedSlug = encodeStorySlug(slug);

  return requestJson<ApiEpisodeReading>(
    `stories/${encodedSlug}/episodes/${episodeNumber}`,
    { language }
  );
}

export function fetchEpisodeAudioMetadata(
  slug: string,
  episodeNumber: number,
  language: StoryLanguage = "en"
): Promise<ApiEpisodeAudioMetadata> {
  validateEpisodeNumber(episodeNumber);

  const encodedSlug = encodeStorySlug(slug);

  return requestJson<ApiEpisodeAudioMetadata>(
    `stories/${encodedSlug}/episodes/${episodeNumber}/audio`,
    { language }
  );
}