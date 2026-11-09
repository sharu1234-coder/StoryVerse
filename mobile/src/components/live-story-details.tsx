import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ApiEpisodeSummary } from "../features/api/storyverse-api";
import { useLiveStoryDetails } from "../features/stories/use-live-story-details";
import type { StoryLanguage } from "../features/stories/types";

interface LiveStoryDetailsProps {
  slug: string;
  language?: StoryLanguage;
}

const LANGUAGE_NAMES: Record<StoryLanguage, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
};

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

function formatGenre(genre: string): string {
  return genre
    .split("-")
    .map((word) =>
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word
    )
    .join(" ");
}

function PublishedEpisodeRow({
  episode,
  storySlug,
}: {
  episode: ApiEpisodeSummary;
  storySlug: string;
}) {
  const isFree = episode.is_free;

  function openEpisode() {
    if (!isFree) {
      return;
    }

    router.push({
      pathname: "/reader/[storyId]/[episodeId]",
      params: {
        storyId: storySlug,
        episodeId: `${storySlug}-episode-${episode.episode_number}`,
      },
    });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${episode.title}, ${
        isFree ? "free episode" : "premium episode locked"
      }`}
      accessibilityState={{ disabled: !isFree }}
      disabled={!isFree}
      onPress={openEpisode}
      style={styles.episodeCard}
    >
      <View style={styles.episodeNumberBox}>
        <Text style={styles.episodeNumber}>
          {String(episode.episode_number).padStart(2, "0")}
        </Text>
      </View>

      <View style={styles.episodeInformation}>
        <Text style={styles.episodeTitle}>
          {episode.title}
        </Text>

        <Text style={styles.episodeSubtitle}>
          Published episode
        </Text>

        <View
          style={[
            styles.accessBadge,
            !isFree && styles.premiumBadge,
          ]}
        >
          <Ionicons
            name={isFree ? "book-outline" : "lock-closed-outline"}
            size={12}
            color={isFree ? "#E6BC77" : "#D0B1FF"}
          />

          <Text
            style={[
              styles.accessText,
              !isFree && styles.premiumText,
            ]}
          >
            {isFree ? "FREE TO READ" : "PREMIUM"}
          </Text>
        </View>
      </View>

      <Ionicons
        name={isFree ? "chevron-forward" : "lock-closed-outline"}
        size={20}
        color={isFree ? "#E6BC77" : "#868399"}
      />
    </Pressable>
  );
}

export default function LiveStoryDetails({
  slug,
  language = "en",
}: LiveStoryDetailsProps) {
  const { state, retry } = useLiveStoryDetails(slug, language);

  if (state.phase !== "ready") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={goBack}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />

          <Text style={styles.backText}>
            Story Details
          </Text>
        </Pressable>

        <View style={styles.statusContainer}>
          {state.phase === "loading" ? (
            <>
              <ActivityIndicator
                size="large"
                color="#E6BC77"
              />

              <Text style={styles.statusTitle}>
                Opening your story
              </Text>

              <Text style={styles.statusMessage}>
                Fetching published story details...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="cloud-offline-outline"
                size={48}
                color="#D0B1FF"
              />

              <Text style={styles.statusTitle}>
                Story Unavailable
              </Text>

              <Text style={styles.statusMessage}>
                {state.message}
              </Text>

              {state.retryable && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading story details"
                  onPress={retry}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>
                    Try Again
                  </Text>
                </Pressable>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Return to stories"
                onPress={goBack}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>
                  Back to Stories
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { story, episodes } = state;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={goBack}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />

          <Text style={styles.backText}>
            Story Details
          </Text>
        </Pressable>

        <LinearGradient
          colors={["#61436E", "#29223F", "#141927"]}
          style={styles.cover}
        >
          <View style={styles.coverEmblem}>
            <Ionicons
              name="book-outline"
              size={42}
              color="#F6DEAC"
            />
          </View>

          <Text style={styles.coverEyebrow}>
            STORYVERSE ORIGINALS
          </Text>

          <Text style={styles.coverTitle}>
            {story.title}
          </Text>

          {story.tagline ? (
            <Text style={styles.coverTagline}>
              {story.tagline}
            </Text>
          ) : null}
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.publicationRow}>
            <View style={styles.publishedBadge}>
              <View style={styles.publishedDot} />

              <Text style={styles.publishedText}>
                PUBLISHED
              </Text>
            </View>

            <Text style={styles.languageText}>
              {LANGUAGE_NAMES[story.language_code]}
            </Text>
          </View>

          <Text style={styles.storyTitle}>
            {story.title}
          </Text>

          <Text style={styles.author}>
            By {story.author_display_name}
          </Text>

          <View style={styles.metadataRow}>
            <Ionicons
              name="layers-outline"
              size={17}
              color="#E6BC77"
            />

            <Text style={styles.metadataText}>
              {episodes.length} published{" "}
              {episodes.length === 1 ? "episode" : "episodes"}
            </Text>
          </View>

          {story.genres.length > 0 && (
            <View style={styles.genreRow}>
              {story.genres.map((genre) => (
                <View key={genre} style={styles.genreChip}>
                  <Text style={styles.genreText}>
                    {formatGenre(genre)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {story.description ? (
            <>
              <Text style={styles.sectionTitle}>
                About this story
              </Text>

              <Text style={styles.description}>
                {story.description}
              </Text>
            </>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Episodes
            </Text>

            <Text style={styles.episodeCount}>
              {episodes.length} published
            </Text>
          </View>

          {episodes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="book-outline"
                size={30}
                color="#E6BC77"
              />

              <Text style={styles.emptyTitle}>
                Episodes coming soon
              </Text>

              <Text style={styles.emptyMessage}>
                This story does not have any published episodes
                available in the selected language yet.
              </Text>
            </View>
          ) : (
            episodes.map((episode) => (
              <PublishedEpisodeRow
                key={episode.episode_number}
                episode={episode}
                storySlug={story.slug}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#090B12",
  },
  content: {
    paddingBottom: 56,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
  statusTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 22,
    textAlign: "center",
  },
  statusMessage: {
    color: "#A9A6BB",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: "#E6BC77",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 28,
  },
  retryText: {
    color: "#17131F",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 18,
    padding: 12,
  },
  secondaryText: {
    color: "#D0B1FF",
    fontSize: 13,
    fontWeight: "700",
  },
  cover: {
    minHeight: 300,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  coverEmblem: {
    width: 78,
    height: 78,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  coverEyebrow: {
    color: "#E6BC77",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 13,
  },
  coverTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "800",
    textAlign: "center",
  },
  coverTagline: {
    color: "#E3D9E8",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 13,
  },
  body: {
    paddingHorizontal: 22,
  },
  publicationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 27,
  },
  publishedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#18362F",
  },
  publishedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#6FD2A3",
  },
  publishedText: {
    color: "#8EE5B8",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },
  languageText: {
    color: "#B5AEC7",
    fontSize: 12,
  },
  storyTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 23,
  },
  author: {
    color: "#B3AEC1",
    fontSize: 13,
    marginTop: 9,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 21,
  },
  metadataText: {
    color: "#CEC8D6",
    fontSize: 12,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 22,
  },
  genreChip: {
    backgroundColor: "#282238",
    borderColor: "#493A59",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  genreText: {
    color: "#D8C4EA",
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 32,
  },
  description: {
    color: "#B8B5C6",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  episodeCount: {
    color: "#E6BC77",
    fontSize: 12,
    fontWeight: "600",
  },
  episodeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#181B29",
    borderColor: "#353044",
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
  },
  episodeNumberBox: {
    width: 48,
    height: 57,
    backgroundColor: "#33283F",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeNumber: {
    color: "#E6BC77",
    fontSize: 19,
    fontWeight: "800",
  },
  episodeInformation: {
    flex: 1,
  },
  episodeTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  episodeSubtitle: {
    color: "#A8A3B7",
    fontSize: 11,
    marginTop: 5,
  },
  accessBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#352D2A",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 10,
  },
  premiumBadge: {
    backgroundColor: "#332A45",
  },
  accessText: {
    color: "#E6BC77",
    fontSize: 10,
    fontWeight: "700",
  },
  premiumText: {
    color: "#D0B1FF",
  },
  emptyCard: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#181B29",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#353044",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 13,
  },
  emptyMessage: {
    color: "#B3AEC1",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 9,
  },
});