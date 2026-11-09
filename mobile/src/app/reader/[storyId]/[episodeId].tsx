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
  StoryVerseApiError,
} from "../../../features/api/storyverse-api";
import { getStoryById } from "../../../features/stories/catalog";

type ReaderLoadState =
  | { kind: "loading" }
  | {
      kind: "ready";
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

export default function StoryEpisodeReaderScreen() {
  const { storyId, episodeId } = useLocalSearchParams<{
    storyId: string;
    episodeId: string;
  }>();

  const story = getStoryById(storyId);

  const episode = story?.episodes.find(
    (item) => item.id === episodeId
  );

  const canReadLocalSample =
    episode?.access === "free" &&
    (episode.availability === "sample" ||
      episode.availability === "ready") &&
    Boolean(episode.text?.trim());

  const [state, setState] = useState<ReaderLoadState>({
    kind: "loading",
  });

  useEffect(() => {
    let active = true;

    if (!story || !episode || !canReadLocalSample) {
      setState({
        kind: "unavailable",
        message:
          "This episode is not currently available for free reading.",
      });

      return () => {
        active = false;
      };
    }

    const currentStory = story;
    const currentEpisode = episode;

    setState({ kind: "loading" });

    async function loadEpisode() {
      try {
        const response = await fetchEpisodeReading(
          currentStory.id,
          currentEpisode.number,
          currentStory.language
        );

        if (
          response.episode_number !== currentEpisode.number ||
          response.language_code !== currentStory.language ||
          typeof response.body_text !== "string" ||
          !response.body_text.trim()
        ) {
          throw new Error("Invalid episode response.");
        }

        if (active) {
          setState({
            kind: "ready",
            title: response.title,
            body: response.body_text,
            source: "backend",
          });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const accessDenied =
          error instanceof StoryVerseApiError &&
          error.status !== null &&
          error.status >= 400 &&
          error.status < 500;

        if (accessDenied) {
          setState({
            kind: "unavailable",
            message:
              "This episode is not currently published for free reading.",
          });

          return;
        }

        if (currentEpisode.text?.trim()) {
          setState({
            kind: "ready",
            title: currentEpisode.title,
            body: currentEpisode.text,
            source: "local-sample",
          });
        } else {
          setState({
            kind: "unavailable",
            message:
              "Unable to load this episode. Please try again later.",
          });
        }
      }
    }

    void loadEpisode();

    return () => {
      active = false;
    };
  }, [
    storyId,
    episodeId,
    episode?.number,
    story?.language,
    canReadLocalSample,
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

  if (!story || !episode) {
    return (
      <ReaderStatus
        title="Story Not Found"
        message="This story is no longer available."
      />
    );
  }

  const pages = paginateEpisode(state.body);

  return (
    <StoryVerseReader
      storyId={story.id}
      episodeId={episode.id}
      storyTitle={story.title}
      episodeTitle={state.title}
      pages={pages}
      isSample={episode.availability === "sample"}
    />
  );
}