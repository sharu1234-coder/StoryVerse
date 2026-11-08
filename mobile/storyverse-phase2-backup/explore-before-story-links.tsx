import { useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LANGUAGES = [
  { id: "en", name: "English" },
  { id: "te", name: "Telugu" },
  { id: "hi", name: "Hindi" },
  { id: "ta", name: "Tamil" },
] as const;

const FEATURED = [
  {
    name: "Romance",
    icon: "heart-outline",
    colors: ["#633151", "#211522"],
  },
  {
    name: "Mystery",
    icon: "search-outline",
    colors: ["#263E66", "#111C34"],
  },
  {
    name: "Fantasy",
    icon: "sparkles-outline",
    colors: ["#514188", "#201937"],
  },
  {
    name: "Horror",
    icon: "moon-outline",
    colors: ["#622B35", "#211317"],
  },
  {
    name: "Mythology",
    icon: "flame-outline",
    colors: ["#74512C", "#2A1B15"],
  },
] as const;

const GENRES = [
  "Action",
  "Adventure",
  "Biography",
  "Children's Stories",
  "Comedy",
  "Coming of Age",
  "Contemporary Romance",
  "Crime",
  "Dark Fantasy",
  "Detective",
  "Devotional",
  "Drama",
  "Dystopian",
  "Epic Fantasy",
  "Fairy Tales",
  "Family",
  "Fantasy",
  "Folklore",
  "Historical Fiction",
  "Historical Romance",
  "Horror",
  "Literary Classics",
  "Literary Fiction",
  "LGBTQ+ Fiction",
  "Magical Realism",
  "Memoir",
  "Military Fiction",
  "Mystery",
  "Mythology",
  "Paranormal",
  "Philosophy",
  "Poetry",
  "Political Fiction",
  "Psychological Thriller",
  "Romance",
  "Satire",
  "Science Fiction",
  "Self-Help",
  "Slice of Life",
  "Spiritual",
  "Sports Fiction",
  "Supernatural",
  "Suspense",
  "Thriller",
  "Time Travel",
  "War Fiction",
  "Women's Fiction",
  "Young Adult",
] as const;

type LanguageId = (typeof LANGUAGES)[number]["id"];

export default function ExploreScreen() {
  const [language, setLanguage] = useState<LanguageId>("en");
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filteredGenres = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return GENRES;
    }

    return GENRES.filter((genre) =>
      genre.toLowerCase().includes(query)
    );
  }, [search]);

  const languageName =
    LANGUAGES.find((item) => item.id === language)?.name ?? "English";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.eyebrow}>DISCOVER STORYVERSE</Text>

        <Text style={styles.title}>Explore</Text>

        <Text style={styles.subtitle}>
          Find stories that stay with you.
        </Text>

        <LinearGradient
          colors={["#49346C", "#271B41", "#151320"]}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Ionicons
              name="sparkles-outline"
              size={24}
              color="#E8D7FF"
            />
          </View>

          <Text style={styles.heroTitle}>
            A universe of stories.
          </Text>

          <Text style={styles.heroSubtitle}>
            Every mood. Every world. Every language.
          </Text>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              4 LAUNCH LANGUAGES
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#9390A9"
          />

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search genres..."
            placeholderTextColor="#85839A"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search story genres"
          />

          {search.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch("")}
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#9390A9"
              />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Choose your language
        </Text>

        <Text style={styles.sectionSubtitle}>
          Discover stories in the language you love.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.languageRow}
        >
          {LANGUAGES.map((item) => {
            const active = language === item.id;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setLanguage(item.id)}
                style={[
                  styles.languageChip,
                  active && styles.languageChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.languageText,
                    active && styles.languageTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>
            Featured genres
          </Text>

          <Ionicons
            name="sparkles"
            size={18}
            color="#CFABFF"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredRow}
        >
          {FEATURED.map((item) => (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityLabel={`Explore ${item.name}`}
              onPress={() => setSelectedGenre(item.name)}
              style={styles.featuredCard}
            >
              <LinearGradient
                colors={[item.colors[0], item.colors[1]]}
                style={styles.featuredGradient}
              >
                <Ionicons
                  name={item.icon}
                  size={30}
                  color="#FFFFFF"
                />

                <Text style={styles.featuredName}>
                  {item.name}
                </Text>

                <Text style={styles.featuredHint}>
                  Explore genre
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>
            All genres
          </Text>

          <Text style={styles.count}>
            {filteredGenres.length} genres
          </Text>
        </View>

        <View style={styles.genreWrap}>
          {filteredGenres.map((genre) => {
            const active = selectedGenre === genre;

            return (
              <Pressable
                key={genre}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedGenre(genre)}
                style={[
                  styles.genreChip,
                  active && styles.genreChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.genreText,
                    active && styles.genreTextActive,
                  ]}
                >
                  {genre}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredGenres.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons
              name="search-outline"
              size={32}
              color="#9793AD"
            />

            <Text style={styles.noResultsTitle}>
              No matching genres
            </Text>

            <Text style={styles.noResultsText}>
              Try another search term.
            </Text>
          </View>
        )}

        <View style={styles.selectionPanel}>
          <View style={styles.selectionHeader}>
            <Ionicons
              name="book-outline"
              size={22}
              color="#D7B3FF"
            />

            <Text style={styles.selectionTitle}>
              Your discovery selection
            </Text>
          </View>

          <Text style={styles.selectionValue}>
            {selectedGenre === "All"
              ? "All genres"
              : selectedGenre}
            {"  |  "}
            {languageName}
          </Text>

          <Text style={styles.selectionDescription}>
            Story recommendations and episodes for this
            selection will appear here when the catalog
            is published.
          </Text>

          {selectedGenre !== "All" && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedGenre("All")}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>
                Clear genre selection
              </Text>
            </Pressable>
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
    paddingTop: 28,
    paddingBottom: 45,
  },
  eyebrow: {
    color: "#CBA8FF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginHorizontal: 22,
    marginBottom: 9,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "800",
    marginHorizontal: 22,
    letterSpacing: -1,
  },
  subtitle: {
    color: "#AAA9BD",
    fontSize: 15,
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  hero: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 25,
    minHeight: 195,
    justifyContent: "center",
  },
  heroIcon: {
    marginBottom: 12,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: "#D4C7EA",
    fontSize: 13,
    marginTop: 7,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF20",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  heroBadgeText: {
    color: "#F0E5FF",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#171925",
    borderColor: "#2C2B40",
    borderWidth: 1,
    borderRadius: 16,
    height: 54,
    marginHorizontal: 20,
    marginTop: 25,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    height: "100%",
  },
  sectionTitle: {
    color: "#F5F2FF",
    fontSize: 19,
    fontWeight: "700",
    marginHorizontal: 20,
    marginTop: 30,
  },
  sectionSubtitle: {
    color: "#9896AD",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: 6,
  },
  languageRow: {
    paddingHorizontal: 20,
    gap: 10,
    paddingTop: 17,
    paddingBottom: 4,
  },
  languageChip: {
    paddingHorizontal: 19,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#303043",
    backgroundColor: "#171925",
  },
  languageChipActive: {
    backgroundColor: "#39254F",
    borderColor: "#B78CEA",
  },
  languageText: {
    color: "#B5B2C8",
    fontSize: 13,
    fontWeight: "600",
  },
  languageTextActive: {
    color: "#EAD5FF",
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 22,
  },
  featuredRow: {
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 17,
  },
  featuredCard: {
    width: 155,
    height: 142,
    borderRadius: 19,
    overflow: "hidden",
  },
  featuredGradient: {
    flex: 1,
    padding: 18,
    justifyContent: "flex-end",
  },
  featuredName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 15,
  },
  featuredHint: {
    color: "#DDD2E9",
    fontSize: 11,
    marginTop: 4,
  },
  count: {
    color: "#A59BB7",
    fontSize: 12,
  },
  genreWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    paddingHorizontal: 20,
    paddingTop: 19,
  },
  genreChip: {
    backgroundColor: "#171925",
    borderColor: "#303043",
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  genreChipActive: {
    backgroundColor: "#39254F",
    borderColor: "#B78CEA",
  },
  genreText: {
    color: "#C6C3D7",
    fontSize: 12,
    fontWeight: "600",
  },
  genreTextActive: {
    color: "#EAD5FF",
  },
  noResults: {
    marginHorizontal: 20,
    padding: 30,
    alignItems: "center",
    backgroundColor: "#151724",
    borderRadius: 18,
    marginTop: 20,
    gap: 8,
  },
  noResultsTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  noResultsText: {
    color: "#AAA8BF",
    fontSize: 13,
  },
  selectionPanel: {
    backgroundColor: "#171925",
    borderColor: "#38304C",
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 32,
    padding: 20,
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  selectionValue: {
    color: "#D7B3FF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 18,
  },
  selectionDescription: {
    color: "#A7A4BA",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 9,
  },
  clearButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    paddingVertical: 10,
  },
  clearButtonText: {
    color: "#CDA8FF",
    fontSize: 13,
    fontWeight: "700",
  },
});