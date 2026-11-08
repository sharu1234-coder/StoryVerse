import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PREVIEW_STORIES } from "../features/stories/catalog";
import type { StoryLanguage } from "../features/stories/types";

type Props = {
  language: StoryLanguage;
  genre: string;
};

export function StoryPreviewList({ language, genre }: Props) {
  const stories = PREVIEW_STORIES.filter(
    (story) =>
      story.language === language &&
      (genre === "All" ||
        story.genres.some(
          (item) => item.toLowerCase() === genre.toLowerCase()
        ))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Originals in development
        </Text>

        <Text style={styles.count}>
          {stories.length} stories
        </Text>
      </View>

      <Text style={styles.subtitle}>
        Preview upcoming StoryVerse Originals.
      </Text>

      {stories.length === 0 && (
        <View style={styles.empty}>
          <Ionicons
            name="library-outline"
            size={27}
            color="#AD9CC2"
          />

          <Text style={styles.emptyText}>
            No draft stories match this selection yet.
          </Text>
        </View>
      )}

      {stories.map((story) => (
        <Pressable
          key={story.id}
          accessibilityRole="button"
          accessibilityLabel={`View ${story.title} details`}
          onPress={() =>
            router.push({
              pathname: "/story/[id]",
              params: { id: story.id },
            })
          }
          style={styles.card}
        >
          <LinearGradient
            colors={story.coverColors}
            style={styles.cover}
          >
            <Ionicons
              name="book-outline"
              size={28}
              color="#FFFFFF"
            />
          </LinearGradient>

          <View style={styles.information}>
            <Text style={styles.storyTitle}>
              {story.title}
            </Text>

            <Text
              style={styles.description}
              numberOfLines={2}
            >
              {story.description}
            </Text>

            <Text style={styles.episodes}>
              {story.episodes.length} planned episodes
            </Text>

            <Text style={styles.previewTag}>
              VIEW PREVIEW
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#C3AADF"
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#F6F3FF",
    fontSize: 19,
    fontWeight: "700",
    flex: 1,
  },
  count: {
    color: "#A59DB8",
    fontSize: 12,
  },
  subtitle: {
    color: "#9693AB",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 17,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#151724",
    borderColor: "#2C2B3D",
    borderWidth: 1,
    borderRadius: 19,
    padding: 12,
    marginBottom: 12,
  },
  cover: {
    width: 85,
    height: 119,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  information: {
    flex: 1,
  },
  storyTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  description: {
    color: "#A9A6BB",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  episodes: {
    color: "#C4A3E9",
    fontSize: 11,
    marginTop: 9,
  },
  previewTag: {
    color: "#D7B3FF",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 9,
    letterSpacing: 0.5,
  },
  empty: {
    backgroundColor: "#151724",
    padding: 24,
    alignItems: "center",
    borderRadius: 17,
    gap: 12,
  },
  emptyText: {
    color: "#AAA7BB",
    textAlign: "center",
    fontSize: 13,
  },
});