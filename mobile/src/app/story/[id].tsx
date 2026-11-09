import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getStoryById } from "../../features/stories/catalog";
import type {
  StoryEpisode,
  StoryLanguage,
} from "../../features/stories/types";

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

function EpisodeRow({ episode }: { episode: StoryEpisode }) {
  const canReadSample =
    episode.availability === "sample" &&
    Boolean(episode.text?.trim());

  const statusLabel =
    episode.availability === "sample"
      ? "SAMPLE AVAILABLE"
      : episode.availability === "ready"
        ? "READY"
        : "COMING SOON";

  return (
    <Pressable
      accessibilityRole={canReadSample ? "button" : undefined}
      accessibilityLabel={
        canReadSample
          ? `Read sample: ${episode.title}`
          : undefined
      }
      disabled={!canReadSample}
      onPress={
        canReadSample
          ? () => router.push("/reader/demo")
          : undefined
      }
      style={styles.episodeRow}
    >
      <View style={styles.episodeNumber}>
        <Text style={styles.episodeNumberText}>
          {String(episode.number).padStart(2, "0")}
        </Text>
      </View>

      <View style={styles.episodeInformation}>
        <Text style={styles.episodeTitle}>
          {episode.title}
        </Text>

        <Text style={styles.episodeMeta}>
          {episode.estimatedReadingMinutes} min estimated read
        </Text>

        <View style={styles.episodeBadges}>
          <Text style={styles.plannedBadge}>
            {statusLabel}
          </Text>

          {canReadSample && (
            <Text style={styles.accessBadge}>
              FREE SAMPLE
            </Text>
          )}

          {episode.availability === "ready" && (
            <Text style={styles.accessBadge}>
              {episode.access === "free" ? "FREE" : "PREMIUM"}
            </Text>
          )}
        </View>
      </View>

      <Ionicons
        name={
          canReadSample
            ? "chevron-forward-outline"
            : "time-outline"
        }
        size={20}
        color={canReadSample ? "#D7B3FF" : "#87859D"}
      />
    </Pressable>
  );
}

export default function StoryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStoryById(id);

  if (!story) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Ionicons
            name="book-outline"
            size={48}
            color="#CDA8FF"
          />

          <Text style={styles.notFoundTitle}>
            Story not found
          </Text>

          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />

          <Text style={styles.headerText}>
            Story Details
          </Text>
        </Pressable>

        <LinearGradient
          colors={story.coverColors}
          style={styles.cover}
        >
          <Ionicons
            name="book-outline"
            size={58}
            color="#F4E6FF"
          />

          <Text style={styles.coverEyebrow}>
            STORYVERSE ORIGINALS
          </Text>

          <Text style={styles.coverTitle}>
            {story.title}
          </Text>

          <Text style={styles.coverSubtitle}>
            {story.subtitle}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.statusRow}>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>
                EDITORIAL PREVIEW
              </Text>
            </View>

            <Text style={styles.ageRating}>
              {story.ageRating}
            </Text>
          </View>

          <Text style={styles.storyTitle}>
            {story.title}
          </Text>

          <Text style={styles.author}>
            By {story.authorName}
          </Text>

          <View style={styles.metadataRow}>
            <Ionicons
              name="language-outline"
              size={18}
              color="#CDA8FF"
            />

            <Text style={styles.metadataText}>
              {LANGUAGE_NAMES[story.language]}
            </Text>

            <Ionicons
              name="layers-outline"
              size={18}
              color="#CDA8FF"
            />

            <Text style={styles.metadataText}>
              {story.episodes.length} episodes
            </Text>
          </View>

          <View style={styles.genreRow}>
            {story.genres.map((genre) => (
              <View key={genre} style={styles.genreChip}>
                <Text style={styles.genreText}>
                  {genre}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            About this story
          </Text>

          <Text style={styles.description}>
            {story.description}
          </Text>

          <View style={styles.productionNotice}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#D7B3FF"
            />

            <Text style={styles.productionNoticeText}>
              {story.id === "the-last-monsoon"
                ? "Episode 1 includes a reading sample and an audiobook demonstration. The full novel is still in editorial development."
                : "This novel is in editorial development. Reading and audiobook episodes are not published yet."}
            </Text>
          </View>

          {/* STORYVERSE_READER_DEMO */}
          {story.id === "the-last-monsoon" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open sample book reader"
              onPress={() => router.push("/reader/demo")}
              style={{
                backgroundColor: "#493264",
                borderRadius: 16,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Try the Book Reader
                </Text>

                <Text
                  style={{
                    color: "#DDD0EB",
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  Read an original sample excerpt
                </Text>
              </View>

              <Ionicons
                name="book-outline"
                size={24}
                color="#FFFFFF"
              />
            </Pressable>
          )}
          {/* STORYVERSE_AUDIO_DEMO */}
          {story.id === "the-last-monsoon" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open audiobook demo"
              onPress={() => router.push("/audio/demo")}
              style={{
                backgroundColor: "#202D49",
                borderColor: "#35486E",
                borderWidth: 1,
                borderRadius: 16,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Try the Audiobook Player
                </Text>

                <Text
                  style={{
                    color: "#BFCDEB",
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  Listen to a development narration
                </Text>
              </View>

              <Ionicons
                name="headset-outline"
                size={25}
                color="#C6D7FF"
              />
            </Pressable>
          )}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Episodes
            </Text>

            <Text style={styles.episodeCount}>
              {story.episodes.length} planned
            </Text>
          </View>

          {story.episodes.map((episode) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
            />
          ))}
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
    paddingBottom: 50,
  },
  headerBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cover: {
    height: 285,
    marginHorizontal: 20,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  coverEyebrow: {
    color: "#E5D6F1",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
    marginTop: 20,
  },
  coverTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },
  coverSubtitle: {
    color: "#E4D6EF",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  body: {
    paddingHorizontal: 22,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
  },
  previewBadge: {
    backgroundColor: "#302341",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  previewBadgeText: {
    color: "#D7B3FF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  ageRating: {
    color: "#B8B5C8",
    fontSize: 13,
    fontWeight: "700",
  },
  storyTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 21,
  },
  author: {
    color: "#A9A6BB",
    fontSize: 13,
    marginTop: 8,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 20,
  },
  metadataText: {
    color: "#C6C3D4",
    fontSize: 13,
    marginRight: 15,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 23,
  },
  genreChip: {
    borderWidth: 1,
    borderColor: "#343046",
    backgroundColor: "#191825",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  genreText: {
    color: "#D9CBEB",
    fontSize: 12,
  },
  sectionTitle: {
    color: "#F6F3FF",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 32,
  },
  description: {
    color: "#B6B3C6",
    fontSize: 14,
    lineHeight: 23,
    marginTop: 13,
  },
  productionNotice: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#211A31",
    borderWidth: 1,
    borderColor: "#433258",
    borderRadius: 17,
    padding: 17,
    marginTop: 24,
  },
  productionNoticeText: {
    color: "#D8CBE8",
    fontSize: 12,
    lineHeight: 20,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 17,
  },
  episodeCount: {
    color: "#A59DB8",
    fontSize: 12,
  },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: "#151724",
    borderColor: "#292B3B",
    borderWidth: 1,
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
  },
  episodeNumber: {
    width: 45,
    height: 55,
    backgroundColor: "#302341",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeNumberText: {
    color: "#E0C6FF",
    fontSize: 17,
    fontWeight: "800",
  },
  episodeInformation: {
    flex: 1,
  },
  episodeTitle: {
    color: "#F5F3FF",
    fontSize: 14,
    fontWeight: "700",
  },
  episodeMeta: {
    color: "#9794AC",
    fontSize: 11,
    marginTop: 5,
  },
  episodeBadges: {
    flexDirection: "row",
    gap: 10,
    marginTop: 9,
  },
  plannedBadge: {
    color: "#A9A4BA",
    fontSize: 10,
    fontWeight: "700",
  },
  accessBadge: {
    color: "#CFACFF",
    fontSize: 10,
    fontWeight: "700",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  notFoundTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  backButton: {
    backgroundColor: "#493264",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 14,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});