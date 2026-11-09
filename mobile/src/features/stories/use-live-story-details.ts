import { useCallback, useEffect, useState } from "react";

import {
  fetchPublishedEpisodes,
  fetchStoryDetails,
  StoryVerseApiError,
  type ApiEpisodeSummary,
  type ApiStoryDetail,
} from "../api/storyverse-api";
import type { StoryLanguage } from "./types";

const PAGE_SIZE = 100;

export type LiveStoryDetailsState =
  | { phase: "loading" }
  | {
      phase: "ready";
      story: ApiStoryDetail;
      episodes: ApiEpisodeSummary[];
    }
  | {
      phase: "error";
      message: string;
      retryable: boolean;
    };

async function loadPublishedEpisodes(
  slug: string,
  language: StoryLanguage
): Promise<ApiEpisodeSummary[]> {
  const episodes: ApiEpisodeSummary[] = [];
  const seenNumbers = new Set<number>();

  let expectedTotal: number | null = null;

  while (true) {
    const response = await fetchPublishedEpisodes(
      slug,
      language,
      {
        limit: PAGE_SIZE,
        offset: episodes.length,
      }
    );

    if (
      response.story_slug !== slug ||
      response.language_code !== language ||
      !Array.isArray(response.items) ||
      !Number.isInteger(response.total) ||
      response.total < 0
    ) {
      throw new Error("Invalid published episode response.");
    }

    if (expectedTotal === null) {
      expectedTotal = response.total;
    } else if (response.total !== expectedTotal) {
      throw new Error("Episode list changed during loading.");
    }

    for (const episode of response.items) {
      if (
        !Number.isInteger(episode.episode_number) ||
        episode.episode_number < 1 ||
        typeof episode.slug !== "string" ||
        !episode.slug.trim() ||
        typeof episode.title !== "string" ||
        !episode.title.trim() ||
        episode.language_code !== language ||
        typeof episode.is_free !== "boolean" ||
        seenNumbers.has(episode.episode_number)
      ) {
        throw new Error("Invalid episode metadata.");
      }

      seenNumbers.add(episode.episode_number);
      episodes.push(episode);
    }

    if (episodes.length === expectedTotal) {
      break;
    }

    if (
      response.items.length === 0 ||
      episodes.length > expectedTotal
    ) {
      throw new Error("Incomplete episode pagination.");
    }
  }

  return episodes.sort(
    (first, second) =>
      first.episode_number - second.episode_number
  );
}

function getErrorState(error: unknown): LiveStoryDetailsState {
  if (
    error instanceof StoryVerseApiError &&
    error.status === 404
  ) {
    return {
      phase: "error",
      message:
        "This story is not currently published in the selected language.",
      retryable: false,
    };
  }

  return {
    phase: "error",
    message:
      "The live story is temporarily unavailable. Please check your connection and try again.",
    retryable: true,
  };
}

export function useLiveStoryDetails(
  slug: string,
  language: StoryLanguage = "en"
) {
  const [state, setState] = useState<LiveStoryDetailsState>({
    phase: "loading",
  });

  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => {
    setRetryKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;

    setState({ phase: "loading" });

    async function loadStory() {
      if (!slug.trim()) {
        if (active) {
          setState({
            phase: "error",
            message: "No story was selected.",
            retryable: false,
          });
        }

        return;
      }

      try {
        const [story, episodes] = await Promise.all([
          fetchStoryDetails(slug, language),
          loadPublishedEpisodes(slug, language),
        ]);

        if (
          story.slug !== slug ||
          story.language_code !== language ||
          typeof story.title !== "string" ||
          !story.title.trim() ||
          !Number.isInteger(story.episode_count) ||
          story.episode_count < 0 ||
          !Array.isArray(story.genres)
        ) {
          throw new Error("Invalid published story response.");
        }

        if (active) {
          setState({
            phase: "ready",
            story,
            episodes,
          });
        }
      } catch (error) {
        if (active) {
          setState(getErrorState(error));
        }
      }
    }

    void loadStory();

    return () => {
      active = false;
    };
  }, [slug, language, retryKey]);

  return {
    state,
    retry,
  };
}