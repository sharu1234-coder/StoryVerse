import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StoryVerseReader from "../../../components/storyverse-reader";
import { getStoryById } from "../../../features/stories/catalog";

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

export default function StoryEpisodeReaderScreen() {
  const { storyId, episodeId } = useLocalSearchParams<{
    storyId: string;
    episodeId: string;
  }>();

  const story = getStoryById(storyId);

  const episode = story?.episodes.find(
    (item) => item.id === episodeId
  );

  const canRead =
    episode?.access === "free" &&
    (episode.availability === "sample" ||
      episode.availability === "ready") &&
    Boolean(episode.text?.trim());

  if (!story || !episode || !canRead) {
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
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color="#D7B3FF"
        />

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: "700",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Episode Unavailable
        </Text>

        <Text
          style={{
            color: "#A8A5B8",
            textAlign: "center",
            lineHeight: 22,
            marginTop: 12,
          }}
        >
          This episode is not currently available for free reading.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to stories"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
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
      </SafeAreaView>
    );
  }

  const pages = paginateEpisode(episode.text ?? "");

  return (
    <StoryVerseReader
      storyId={story.id}
      episodeId={episode.id}
      storyTitle={story.title}
      episodeTitle={episode.title}
      pages={pages}
      isSample={episode.availability === "sample"}
    />
  );
}