import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  fetchPublishedStories,
  type ApiStorySummary,
} from "../features/api/storyverse-api";

type ShelfState =
  | { phase: "loading" }
  | { phase: "ready"; stories: ApiStorySummary[] }
  | { phase: "error" };

export default function LiveStoryShelf() {
  const [state, setState] = useState<ShelfState>({
    phase: "loading",
  });

  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadStories() {
      setState({ phase: "loading" });

      try {
        const response = await fetchPublishedStories("en", {
          limit: 10,
          offset: 0,
        });

        if (
          !Array.isArray(response.items) ||
          typeof response.total !== "number"
        ) {
          throw new Error("Invalid story catalog response.");
        }

        if (active) {
          setState({
            phase: "ready",
            stories: response.items,
          });
        }
      } catch {
        if (active) {
          setState({ phase: "error" });
        }
      }
    }

    void loadStories();

    return () => {
      active = false;
    };
  }, [retryKey]);

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <View>
          <Text style={styles.eyebrow}>
            FROM THE STORYVERSE LIBRARY
          </Text>

          <Text style={styles.heading}>
            Available Now
          </Text>

          <Text style={styles.subheading}>
            Stories ready for your next chapter
          </Text>
        </View>
      </View>

      {state.phase === "loading" && (
        <View style={styles.messageCard}>
          <ActivityIndicator
            size="small"
            color="#E6BC77"
          />

          <Text style={styles.messageText}>
            Checking available stories...
          </Text>
        </View>
      )}

      {state.phase === "error" && (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            You're in preview mode
          </Text>

          <Text style={styles.messageText}>
            The live library is temporarily unavailable.
            You can still explore our story previews.
          </Text>

          <Pressable
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry loading published stories"
            onPress={() => setRetryKey((value) => value + 1)}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      )}

      {state.phase === "ready" &&
        state.stories.length === 0 && (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              More stories are on their way
            </Text>

            <Text style={styles.messageText}>
              Explore our curated previews while
              we prepare our next release.
            </Text>
          </View>
        )}

      {state.phase === "ready" &&
        state.stories.map((story) => (
          <Pressable
            key={story.slug}
            style={styles.storyCard}
            accessibilityRole="button"
            accessibilityLabel={`Explore ${story.title}`}
            onPress={() =>
              router.push({
                pathname: "/story/[id]",
                params: {
                  id: story.slug,
                  source: "live",
                },
              })
            }
          >
            <View style={styles.storyEmblem}>
              <Text style={styles.emblemText}>
                SV
              </Text>
            </View>

            <View style={styles.storyContent}>
              <Text style={styles.storyTitle}>
                {story.title}
              </Text>

              <Text style={styles.author}>
                By {story.author_display_name}
              </Text>

              <Text style={styles.storyMeta}>
                {story.episode_count}{" "}
                {story.episode_count === 1
                  ? "published episode"
                  : "published episodes"}
              </Text>

              <Text style={styles.storyTagline}>
                {story.tagline ?? "A world waiting to be discovered."}
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 30,
    marginBottom: 14,
  },
  headingContainer: {
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  eyebrow: {
    color: "#E6BC77",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 7,
  },
  heading: {
    color: "#F7F4EF",
    fontSize: 23,
    fontWeight: "700",
  },
  subheading: {
    color: "#9599AB",
    fontSize: 12,
    marginTop: 6,
  },
  messageCard: {
    backgroundColor: "#151824",
    borderColor: "#292D3B",
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    alignItems: "flex-start",
  },
  messageTitle: {
    color: "#F7F4EF",
    fontSize: 15,
    fontWeight: "700",
  },
  messageText: {
    color: "#A6A8B8",
    fontSize: 12,
    lineHeight: 19,
  },
  retryButton: {
    backgroundColor: "#E6BC77",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
  },
  retryText: {
    color: "#090B12",
    fontSize: 12,
    fontWeight: "700",
  },
  storyCard: {
    backgroundColor: "#191C2A",
    borderColor: "#373142",
    borderWidth: 1,
    borderRadius: 19,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  storyEmblem: {
    width: 56,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#49374F",
    borderColor: "#826984",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emblemText: {
    color: "#E6BC77",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    color: "#F7F4EF",
    fontSize: 16,
    fontWeight: "700",
  },
  author: {
    color: "#A9A4B7",
    fontSize: 11,
    marginTop: 4,
  },
  storyMeta: {
    color: "#E6BC77",
    fontSize: 11,
    marginTop: 8,
    fontWeight: "600",
  },
  storyTagline: {
    color: "#AAA6B6",
    fontSize: 11,
    marginTop: 7,
    lineHeight: 16,
  },
  arrow: {
    color: "#E6BC77",
    fontSize: 28,
    marginLeft: 2,
  },
});