import React, { useMemo, useState } from "react";
import { router } from "expo-router";

import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

const COLORS = {
  background: "#090B12",
  surface: "#151824",
  surface2: "#1D2030",
  white: "#F7F4EF",
  muted: "#9599AB",
  gold: "#E6BC77",
  border: "#292D3B",
};

type Genre =
  | "Romance"
  | "Fantasy"
  | "Thriller"
  | "Horror"
  | "Sci-Fi"
  | "Mystery";

type Story = {
  id: string;
  title: string;
  subtitle: string;
  genre: Genre;
  episodes: number;
  duration: string;
  colors: readonly [string, string, string];
};

const GENRES = [
  "All",
  "Romance",
  "Fantasy",
  "Thriller",
  "Horror",
  "Sci-Fi",
  "Mystery",
] as const;

const STORIES: Story[] = [
  {
    id: "last-monsoon",
    title: "THE LAST\nMONSOON",
    subtitle: "Some promises survive every storm.",
    genre: "Romance",
    episodes: 15,
    duration: "4h 30m",
    colors: ["#655371", "#29344E", "#111724"],
  },
  {
    id: "forgotten-kingdom",
    title: "THE FORGOTTEN\nKINGDOM",
    subtitle: "A throne buried beneath centuries of secrets.",
    genre: "Fantasy",
    episodes: 16,
    duration: "5h 10m",
    colors: ["#71502D", "#332C2A", "#111923"],
  },
  {
    id: "midnight-call",
    title: "THE MIDNIGHT\nCALL",
    subtitle: "Every midnight, someone disappears.",
    genre: "Thriller",
    episodes: 12,
    duration: "3h 20m",
    colors: ["#284F58", "#1A3440", "#0D161F"],
  },
  {
    id: "room-404",
    title: "ROOM\n404",
    subtitle: "Some doors were never meant to open.",
    genre: "Horror",
    episodes: 14,
    duration: "3h 45m",
    colors: ["#68343C", "#301D30", "#11121A"],
  },
  {
    id: "echoes-tomorrow",
    title: "ECHOES OF\nTOMORROW",
    subtitle: "What if tomorrow remembered yesterday?",
    genre: "Sci-Fi",
    episodes: 18,
    duration: "6h 15m",
    colors: ["#305D76", "#233851", "#111525"],
  },
  {
    id: "seventh-key",
    title: "THE SEVENTH\nKEY",
    subtitle: "Six clues. Seven suspects. One truth.",
    genre: "Mystery",
    episodes: 12,
    duration: "3h 50m",
    colors: ["#64583E", "#343B3F", "#151820"],
  },
];

function StoryCover({
  story,
  width = 148,
  height = 205,
}: {
  story: Story;
  width?: number;
  height?: number;
}) {
  return (
    <LinearGradient
      colors={story.colors}
      style={[
        styles.cover,
        {
          width,
          height,
        },
      ]}
    >
      <View style={styles.coverOrb} />

      <Text style={styles.coverBrand}>STORYVERSE ORIGINAL</Text>

      <View style={styles.coverBottom}>
        <Text
          style={[
            styles.coverTitle,
            { fontSize: width > 200 ? 27 : 18 },
          ]}
          numberOfLines={3}
        >
          {story.title}
        </Text>

        <View style={styles.coverLine} />

        <Text style={styles.coverGenre}>
          {story.genre.toUpperCase()}
        </Text>
      </View>
    </LinearGradient>
  );
}

export default function HomeScreen() {
  const [genre, setGenre] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedStory, setSelectedStory] =
    useState<Story | null>(null);

  const visibleStories = useMemo(() => {
    return STORIES.filter((story) => {
      const genreMatches =
        genre === "All" || story.genre === genre;

      const searchMatches =
        story.title
          .replace("\n", " ")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        story.genre.toLowerCase().includes(search.toLowerCase());

      return genreMatches && searchMatches;
    });
  }, [genre, search]);

  const featured = STORIES[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>STORYVERSE</Text>
            <Text style={styles.tagline}>
              Every story is another world.
            </Text>
          </View>

          <Pressable
            style={styles.searchButton}
            onPress={() => setSearchOpen((value) => !value)}
            accessibilityLabel="Search stories"
            accessibilityRole="button"
          >
            <SymbolView
              name={{
                ios: "magnifyingglass",
                android: "search",
                web: "search",
              }}
              tintColor={COLORS.white}
              size={23}
            />
          </Pressable>
        </View>

        {searchOpen && (
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search stories or genres..."
            placeholderTextColor={COLORS.muted}
            style={styles.searchInput}
            autoFocus
          />
        )}

        {/* HERO */}

        <Text style={styles.eyebrow}>WELCOME TO YOUR WORLD</Text>

        <Text style={styles.mainHeading}>
          Stories worth{"\n"}
          <Text style={styles.accentText}>getting lost in.</Text>
        </Text>

        <Pressable
          onPress={() => setSelectedStory(featured)}
          accessibilityRole="button"
          accessibilityLabel="View featured story"
        >
          <LinearGradient
            colors={["#48334C", "#24344B", "#151A28"]}
            style={styles.hero}
          >
            <View style={styles.heroOrb} />

            <View style={styles.heroContent}>
              <Text style={styles.heroBadge}>FEATURED ORIGINAL</Text>

              <Text style={styles.heroTitle}>
                The Last{"\n"}Monsoon
              </Text>

              <Text style={styles.heroSubtitle}>
                Some promises survive every storm.
              </Text>

              <View style={styles.heroMeta}>
                <Text style={styles.heroMetaText}>
                  ROMANCE
                </Text>

                <View style={styles.metaDot} />

                <Text style={styles.heroMetaText}>
                  15 EPISODES
                </Text>
              </View>

              <View style={styles.heroAction}>
                <SymbolView
                  name={{
                    ios: "book",
                    android: "menu_book",
                    web: "menu_book",
                  }}
                  tintColor={COLORS.background}
                  size={19}
                />

                <Text style={styles.heroActionText}>
                  Explore Story
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* GENRES */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore genres</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
        >
          {GENRES.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.genreChip,
                genre === item && styles.genreChipActive,
              ]}
              onPress={() => setGenre(item)}
              accessibilityRole="button"
              accessibilityState={{
                selected: genre === item,
              }}
            >
              <Text
                style={[
                  styles.genreText,
                  genre === item && styles.genreTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* STORY COLLECTION */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Curated for you
            </Text>

            <Text style={styles.sectionSubtitle}>
              Discover your next obsession
            </Text>
          </View>
        </View>

        {visibleStories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              No stories found
            </Text>

            <Text style={styles.emptyDescription}>
              Try another genre or search term.
            </Text>
          </View>
        ) : (
          <FlatList
            data={visibleStories}
            horizontal
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.storyList}
            renderItem={({ item }) => (
              <Pressable
                style={styles.storyCard}
                onPress={() => setSelectedStory(item)}
                accessibilityRole="button"
                accessibilityLabel={`View ${item.title.replace(
                  "\n",
                  " "
                )}`}
              >
                <StoryCover story={item} />

                <Text
                  style={styles.storyName}
                  numberOfLines={2}
                >
                  {item.title.replace("\n", " ")}
                </Text>

                <Text style={styles.storyInfo}>
                  {item.episodes} episodes • {item.genre}
                </Text>
              </Pressable>
            )}
          />
        )}

        {/* MULTILINGUAL FEATURE */}

        <LinearGradient
          colors={["#242237", "#171A28"]}
          style={styles.languageBanner}
        >
          <Text style={styles.bannerEyebrow}>
            ONE UNIVERSE · FOUR LANGUAGES
          </Text>

          <Text style={styles.bannerTitle}>
            Your language.{"\n"}Your story.
          </Text>

          <Text style={styles.bannerDescription}>
            Read and listen in Telugu, Hindi, English
            and Tamil.
          </Text>

          <View style={styles.languageTags}>
            {["తెలుగు", "हिन्दी", "English", "தமிழ்"].map(
              (language) => (
                <View
                  key={language}
                  style={styles.languageTag}
                >
                  <Text style={styles.languageTagText}>
                    {language}
                  </Text>
                </View>
              )
            )}
          </View>
        </LinearGradient>

        <Text style={styles.footer}>
          MADE FOR PEOPLE WHO LOVE STORIES
        </Text>
      </ScrollView>

      {/* STORY INFORMATION MODAL */}

      <Modal
        visible={selectedStory !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedStory(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {selectedStory && (
              <>
                <StoryCover
                  story={selectedStory}
                  width={180}
                  height={230}
                />

                <Text style={styles.modalTitle}>
                  {selectedStory.title.replace("\n", " ")}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {selectedStory.subtitle}
                </Text>

                <Text style={styles.modalMeta}>
                  {selectedStory.genre} •{" "}
                  {selectedStory.episodes} episodes •{" "}
                  {selectedStory.duration}
                </Text>

                {selectedStory.id === "last-monsoon" ? (
                  <View style={{ width: "100%", marginTop: 12, gap: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        width: "100%",
                      }}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Read episode one"
                        onPress={() => {
                          setSelectedStory(null);
                          router.push("/reader/demo");
                        }}
                        style={{
                          flex: 1,
                          minHeight: 50,
                          backgroundColor: COLORS.gold,
                          borderRadius: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.background,
                            fontSize: 13,
                            fontWeight: "700",
                            textAlign: "center",
                          }}
                        >
                          Read Episode 1
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Listen to audiobook demo"
                        onPress={() => {
                          setSelectedStory(null);
                          router.push("/audio/demo");
                        }}
                        style={{
                          flex: 1,
                          minHeight: 50,
                          backgroundColor: "#27354F",
                          borderColor: "#425675",
                          borderWidth: 1,
                          borderRadius: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: 13,
                            fontWeight: "700",
                            textAlign: "center",
                          }}
                        >
                          Listen Now
                        </Text>
                      </Pressable>
                    </View>

                    <Text style={styles.modalNotice}>
                      Experience our sample chapter in reading
                      or audio mode. Full episodes are coming soon.
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.modalNotice}>
                    This story is coming soon. Reading and
                    audiobook episodes are being prepared.
                  </Text>
                )}

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setSelectedStory(null)}
                >
                  <Text style={styles.closeButtonText}>
                    Back to Stories
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 46,
  },

  header: {
    paddingHorizontal: 23,
    paddingTop: 18,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brand: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 3,
    color: COLORS.gold,
  },

  tagline: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  searchButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  searchInput: {
    marginHorizontal: 23,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 14,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.3,
    marginHorizontal: 23,
    marginBottom: 12,
  },

  mainHeading: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "700",
    marginHorizontal: 23,
    marginBottom: 24,
  },

  accentText: {
    color: COLORS.gold,
  },

  hero: {
    marginHorizontal: 18,
    height: 330,
    borderRadius: 23,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  heroOrb: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -60,
    right: -45,
    backgroundColor: "rgba(235, 185, 165, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 232, 213, 0.17)",
  },

  heroContent: {
    padding: 24,
  },

  heroBadge: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.7,
    marginBottom: 12,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 37,
    lineHeight: 43,
    fontWeight: "800",
    marginBottom: 10,
  },

  heroSubtitle: {
    color: "#DFD8E0",
    fontSize: 13,
    lineHeight: 19,
  },

  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 9,
  },

  heroMetaText: {
    color: "#DDD6E0",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.9,
  },

  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },

  heroAction: {
    marginTop: 21,
    alignSelf: "flex-start",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  heroActionText: {
    color: COLORS.background,
    fontWeight: "800",
    fontSize: 13,
  },

  sectionHeader: {
    marginHorizontal: 23,
    marginTop: 34,
    marginBottom: 16,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
  },

  genreList: {
    paddingHorizontal: 23,
    gap: 9,
  },

  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  genreChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },

  genreText: {
    color: "#D5D5DF",
    fontSize: 12,
    fontWeight: "600",
  },

  genreTextActive: {
    color: COLORS.background,
  },

  storyList: {
    paddingHorizontal: 23,
    gap: 16,
  },

  storyCard: {
    width: 148,
  },

  cover: {
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  coverOrb: {
    position: "absolute",
    width: 150,
    height: 150,
    right: -55,
    top: 18,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  coverBrand: {
    fontSize: 7,
    fontWeight: "800",
    color: "#F0DBB1",
    letterSpacing: 1.4,
  },

  coverBottom: {
    gap: 7,
  },

  coverTitle: {
    color: COLORS.white,
    fontWeight: "800",
    lineHeight: 23,
    letterSpacing: 0.5,
  },

  coverLine: {
    width: 28,
    height: 2,
    backgroundColor: COLORS.gold,
  },

  coverGenre: {
    color: "#E2D4C7",
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: "700",
  },

  storyName: {
    color: COLORS.white,
    marginTop: 12,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },

  storyInfo: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

  emptyState: {
    marginHorizontal: 23,
    padding: 25,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7,
  },

  languageBanner: {
    marginHorizontal: 18,
    marginTop: 36,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#38354F",
  },

  bannerEyebrow: {
    color: COLORS.gold,
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: "700",
  },

  bannerTitle: {
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800",
    marginTop: 15,
  },

  bannerDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },

  languageTags: {
    marginTop: 17,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  languageTag: {
    borderWidth: 1,
    borderColor: "#535068",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },

  languageTagText: {
    color: COLORS.white,
    fontSize: 11,
  },

  footer: {
    marginTop: 33,
    textAlign: "center",
    color: "#6C7082",
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.82)",
  },

  modalContent: {
    width: "100%",
    maxWidth: 390,
    padding: 22,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },

  modalTitle: {
    color: COLORS.white,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 20,
  },

  modalSubtitle: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },

  modalMeta: {
    color: COLORS.gold,
    fontSize: 12,
    marginTop: 15,
  },

  modalNotice: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 20,
  },

  closeButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: "stretch",
    marginTop: 22,
  },

  closeButtonText: {
    color: COLORS.background,
    textAlign: "center",
    fontWeight: "800",
  },
});