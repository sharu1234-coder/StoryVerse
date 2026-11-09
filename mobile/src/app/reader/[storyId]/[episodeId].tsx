import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StoryVerseReader from "../../../components/storyverse-reader";
import {
  fetchEpisodeReading,
  fetchStoryDetails,
  StoryVerseApiError,
} from "../../../features/api/storyverse-api";
import { getStoryById } from "../../../features/stories/catalog";

type ReaderLoadState =
  | { kind: "loading" }
  | {
      kind: "ready";
      storyTitle: string;
      title: string;
      body: string;
      source: "backend" | "local-sample";
    }
  | {
      kind: "unavailable";
      message: string;
    };

function paginateEpisode(text: string): string[] {
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const pages: string[] = [];
  let currentPage = "";

  for (const paragraph of paragraphs) {
    if (
      currentPage &&
      currentPage.length + paragraph.length + 2 > 1700
    ) {
      pages.push(currentPage);
      currentPage = paragraph;
    } else {
      currentPage = currentPage
        ? `${currentPage}\n\n${paragraph}`
        : paragraph;
    }
  }

  if (currentPage) {
    pages.push(currentPage);
  }

  return pages;
}

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

function ReaderStatus({
  title,
  message,
  loading = false,
}: {
  title: string;
  message: string;
  loading?: boolean;
}) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#090B12",
        justifyContent: "center",
        alignItems: "center",
        padding: 28,
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#D7B3FF"
        />
      ) : (
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color="#D7B3FF"
        />
      )}

      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 22,
          fontWeight: "700",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: "#A8A5B8",
          textAlign: "center",
          lineHeight: 22,
          marginTop: 12,
        }}
      >
        {message}
      </Text>

      {!loading && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to stories"
          onPress={goBack}
          style={{
            marginTop: 28,
            backgroundColor: "#D7B3FF",
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Text
            style={{
              color: "#17121F",
              fontWeight: "700",
            }}
          >
            Go Back
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function getEpisodeNumber(
  storySlug: string,
  episodeId: string
): number | null {
  const prefix = `${storySlug}-episode-`;

  if (!storySlug || !episodeId.startsWith(prefix)) {
    return null;
  }

  const suffix = episodeId.slice(prefix.length);

  if (!/^[1-9]\d*$/.test(suffix)) {
    return null;
  }

  const number = Number(suffix);

  return Number.isSafeInteger(number) ? number : null;
}

export default function StoryEpisodeReaderScreen() {
  const { storyId, episodeId } = useLocalSearchParams<{
    storyId: string;
    episodeId: string;
  }>();

  const storySlug =
    typeof storyId === "string" ? storyId : "";

  const episodeKey =
    typeof episodeId === "string" ? episodeId : "";

  const episodeNumber = getEpisodeNumber(
    storySlug,
    episodeKey
  );

  const previewStory = getStoryById(storySlug);

  const previewEpisode = previewStory?.episodes.find(
    (item) => item.id === episodeKey
  );

  const language = previewStory?.language ?? "en";

  const [state, setState] = useState<ReaderLoadState>({
    kind: "loading",
  });

  useEffect(() => {
    let active = true;

    if (!storySlug || episodeNumber === null) {
      setState({
        kind: "unavailable",
        message: "Invalid story or episode.",
      });

      return () => {
        active = false;
      };
    }

    setState({ kind: "loading" });

    async function loadEpisode() {
      try {
        const [reading, storyDetails] = await Promise.all([
          fetchEpisodeReading(
            storySlug,
            episodeNumber!,
            language
          ),
          fetchStoryDetails(
            storySlug,
            language
          ),
        ]);

        if (
          reading.episode_number !== episodeNumber ||
          reading.language_code !== language ||
          reading.is_free !== true ||
          typeof reading.title !== "string" ||
          !reading.title.trim() ||
          typeof reading.body_text !== "string" ||
          !reading.body_text.trim() ||
          storyDetails.slug !== storySlug ||
          storyDetails.language_code !== language ||
          typeof storyDetails.title !== "string" ||
          !storyDetails.title.trim()
        ) {
          throw new Error("Invalid published episode response.");
        }

        if (active) {
          setState({
            kind: "ready",
            storyTitle: storyDetails.title,
            title: reading.title,
            body: reading.body_text,
            source: "backend",
          });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const status =
          error instanceof StoryVerseApiError
            ? error.status
            : null;

        if (
          status !== null &&
          status >= 400 &&
          status < 500
        ) {
          setState({
            kind: "unavailable",
            message:
              "This episode is not currently published for free reading.",
          });

          return;
        }

        const canUseLocalSample =
          previewEpisode?.access === "free" &&
          (previewEpisode.availability === "sample" ||
            previewEpisode.availability === "ready") &&
          Boolean(previewEpisode.text?.trim());

        const isRecoverableApiFailure =
          error instanceof StoryVerseApiError &&
          (error.status === null || error.status >= 500);

        if (
          isRecoverableApiFailure &&
          canUseLocalSample &&
          previewStory &&
          previewEpisode?.text
        ) {
          setState({
            kind: "ready",
            storyTitle: previewStory.title,
            title: previewEpisode.title,
            body: previewEpisode.text,
            source: "local-sample",
          });

          return;
        }

        setState({
          kind: "unavailable",
          message:
            "Unable to load this episode. Please check your connection and try again.",
        });
      }
    }

    void loadEpisode();

    return () => {
      active = false;
    };
  }, [
    storySlug,
    episodeKey,
    episodeNumber,
    language,
    previewEpisode,
    previewStory,
  ]);

  if (state.kind === "loading") {
    return (
      <ReaderStatus
        title="Opening your story"
        message="Preparing your reading experience..."
        loading
      />
    );
  }

  if (state.kind === "unavailable") {
    return (
      <ReaderStatus
        title="Episode Unavailable"
        message={state.message}
      />
    );
  }

  const pages = paginateEpisode(state.body);

  return (
    <StoryVerseReader
      storyId={storySlug}
      episodeId={episodeKey}
      storyTitle={state.storyTitle}
      episodeTitle={state.title}
      pages={pages}
      isSample={state.source === "local-sample"}
    />
  );
}
