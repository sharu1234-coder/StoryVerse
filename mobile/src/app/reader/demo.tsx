import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
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
import { StatusBar } from "expo-status-bar";

import {
  DEFAULT_READER_PREFERENCES,
  loadEpisodeProgress,
  loadReaderPreferences,
  saveEpisodeProgress,
  saveReaderPreferences,
  type ReaderFont,
  type ReaderPreferences,
  type ReaderTheme,
} from "../../features/reader/storage";

import {
  READER_DEMO_EPISODE_ID,
  READER_DEMO_PAGES,
  READER_DEMO_STORY_ID,
  READER_DEMO_TITLE,
} from "../../features/reader/demo";

const THEMES: Record<
  ReaderTheme,
  {
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    border: string;
  }
> = {
  night: {
    background: "#0D0E16",
    surface: "#1A1B29",
    text: "#F4EFF9",
    muted: "#AAA6BB",
    accent: "#D7B3FF",
    border: "#37354C",
  },
  sepia: {
    background: "#F2E7D1",
    surface: "#E6D8BE",
    text: "#423227",
    muted: "#806B56",
    accent: "#805B43",
    border: "#D2BE9E",
  },
  paper: {
    background: "#FAF9F5",
    surface: "#F0EEE8",
    text: "#25242A",
    muted: "#68646E",
    accent: "#6250A5",
    border: "#DAD6CD",
  },
};

const LAST_PAGE = READER_DEMO_PAGES.length - 1;

export default function ReaderDemoScreen() {
  const [preferences, setPreferences] = useState<ReaderPreferences>(
    DEFAULT_READER_PREFERENCES
  );

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function restore() {
      const [savedPreferences, savedProgress] = await Promise.all([
        loadReaderPreferences(),
        loadEpisodeProgress(
          READER_DEMO_STORY_ID,
          READER_DEMO_EPISODE_ID
        ),
      ]);

      if (!mounted) {
        return;
      }

      setPreferences(savedPreferences);

      const savedPage = Math.round(
        (savedProgress?.progress ?? 0) * LAST_PAGE
      );

      setPage(Math.max(0, Math.min(LAST_PAGE, savedPage)));
      setLoading(false);
    }

    void restore().catch(() => {
      if (mounted) {
        setSaveError(true);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const colors = THEMES[preferences.theme];

  function updatePreferences(patch: Partial<ReaderPreferences>) {
    const updated = {
      ...preferences,
      ...patch,
    };

    setPreferences(updated);

    void saveReaderPreferences(updated).catch(() => {
      setSaveError(true);
    });
  }

  function changePage(nextPage: number) {
    if (nextPage < 0 || nextPage > LAST_PAGE) {
      return;
    }

    setPage(nextPage);

    const progress =
      LAST_PAGE === 0 ? 1 : nextPage / LAST_PAGE;

    void saveEpisodeProgress(
      READER_DEMO_STORY_ID,
      READER_DEMO_EPISODE_ID,
      progress
    ).catch(() => {
      setSaveError(true);
    });
  }

  const percent =
    ((page + 1) / READER_DEMO_PAGES.length) * 100;

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#D7B3FF" size="large" />
        <Text style={styles.loadingText}>
          Opening your book...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        style={preferences.theme === "night" ? "light" : "dark"}
      />

      <View
        style={[
          styles.toolbar,
          { borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close reader"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          style={styles.toolbarButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </Pressable>

        <Text
          style={[styles.toolbarTitle, { color: colors.text }]}
        >
          Reader Preview
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reading settings"
          accessibilityState={{ expanded: settingsOpen }}
          onPress={() => setSettingsOpen((current) => !current)}
          style={styles.toolbarButton}
        >
          <Ionicons
            name="options-outline"
            size={23}
            color={colors.text}
          />
        </Pressable>
      </View>

      {settingsOpen && (
        <View
          style={[
            styles.settings,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[styles.settingTitle, { color: colors.text }]}
          >
            Reading Appearance
          </Text>

          <View style={styles.settingRow}>
            {(["night", "sepia", "paper"] as ReaderTheme[]).map(
              (theme) => (
                <Pressable
                  key={theme}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: preferences.theme === theme,
                  }}
                  onPress={() => updatePreferences({ theme })}
                  style={[
                    styles.settingChip,
                    {
                      borderColor:
                        preferences.theme === theme
                          ? colors.accent
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.settingChipText,
                      { color: colors.text },
                    ]}
                  >
                    {theme.toUpperCase()}
                  </Text>
                </Pressable>
              )
            )}
          </View>

          <View style={styles.settingRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease font size"
              onPress={() =>
                updatePreferences({
                  fontSize: Math.max(
                    14,
                    preferences.fontSize - 2
                  ),
                })
              }
              style={styles.fontButton}
            >
              <Text
                style={[
                  styles.fontButtonText,
                  { color: colors.text },
                ]}
              >
                A-
              </Text>
            </Pressable>

            <Text
              style={[styles.fontValue, { color: colors.muted }]}
            >
              {preferences.fontSize}px
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase font size"
              onPress={() =>
                updatePreferences({
                  fontSize: Math.min(
                    30,
                    preferences.fontSize + 2
                  ),
                })
              }
              style={styles.fontButton}
            >
              <Text
                style={[
                  styles.fontButtonText,
                  { color: colors.text },
                ]}
              >
                A+
              </Text>
            </Pressable>

            {(["serif", "sans"] as ReaderFont[]).map((font) => (
              <Pressable
                key={font}
                accessibilityRole="button"
                accessibilityState={{
                  selected: preferences.font === font,
                }}
                onPress={() => updatePreferences({ font })}
                style={[
                  styles.settingChip,
                  {
                    borderColor:
                      preferences.font === font
                        ? colors.accent
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.settingChipText,
                    { color: colors.text },
                  ]}
                >
                  {font === "serif" ? "Serif" : "Sans"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.settingRow}>
            <Text
              style={[styles.spacingLabel, { color: colors.muted }]}
            >
              Line spacing
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease line spacing"
              onPress={() =>
                updatePreferences({
                  lineHeight: Math.max(
                    1.3,
                    Math.round(
                      (preferences.lineHeight - 0.1) * 10
                    ) / 10
                  ),
                })
              }
              style={styles.fontButton}
            >
              <Text style={{ color: colors.text }}>-</Text>
            </Pressable>

            <Text style={{ color: colors.text }}>
              {preferences.lineHeight.toFixed(1)}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase line spacing"
              onPress={() =>
                updatePreferences({
                  lineHeight: Math.min(
                    2.2,
                    Math.round(
                      (preferences.lineHeight + 0.1) * 10
                    ) / 10
                  ),
                })
              }
              style={styles.fontButton}
            >
              <Text style={{ color: colors.text }}>+</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView
        key={page}
        style={styles.readerScroll}
        contentContainerStyle={styles.readerContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.chapterEyebrow,
            { color: colors.accent },
          ]}
        >
          THE LAST MONSOON
        </Text>

        <Text
          style={[
            styles.chapterTitle,
            { color: colors.text },
          ]}
        >
          {READER_DEMO_TITLE}
        </Text>

        <Text
          style={[
            styles.sampleLabel,
            { color: colors.muted },
          ]}
        >
          ORIGINAL SAMPLE EXCERPT
        </Text>

        <Text
          style={{
            color: colors.text,
            fontFamily:
              preferences.font === "serif"
                ? "serif"
                : "sans-serif",
            fontSize: preferences.fontSize,
            lineHeight: Math.round(
              preferences.fontSize *
                preferences.lineHeight
            ),
            textAlign: "left",
            marginTop: 30,
          }}
        >
          {READER_DEMO_PAGES[page]}
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${percent}%`,
                backgroundColor: colors.accent,
              },
            ]}
          />
        </View>

        <View style={styles.footerControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous page"
            disabled={page === 0}
            onPress={() => changePage(page - 1)}
            style={styles.pageButton}
          >
            <Ionicons
              name="chevron-back"
              size={19}
              color={page === 0 ? colors.muted : colors.text}
            />

            <Text
              style={{
                color:
                  page === 0 ? colors.muted : colors.text,
              }}
            >
              Previous
            </Text>
          </Pressable>

          <Text
            style={[styles.pageCounter, { color: colors.muted }]}
          >
            {page + 1} / {READER_DEMO_PAGES.length}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next page"
            disabled={page === LAST_PAGE}
            onPress={() => changePage(page + 1)}
            style={styles.pageButton}
          >
            <Text
              style={{
                color:
                  page === LAST_PAGE
                    ? colors.muted
                    : colors.text,
              }}
            >
              Next
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={
                page === LAST_PAGE
                  ? colors.muted
                  : colors.text
              }
            />
          </Pressable>
        </View>

        {saveError && (
          <Text style={styles.saveError}>
            Some reading preferences could not be saved.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: "#0D0E16",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  loadingText: {
    color: "#D7B3FF",
  },
  toolbar: {
    height: 58,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  toolbarButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  settings: {
    borderBottomWidth: 1,
    paddingHorizontal: 17,
    paddingVertical: 16,
    gap: 14,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
  },
  settingChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  settingChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  fontButton: {
    width: 40,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
  },
  fontButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
  fontValue: {
    fontSize: 12,
  },
  spacingLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  readerScroll: {
    flex: 1,
  },
  readerContent: {
    paddingHorizontal: 26,
    paddingTop: 34,
    paddingBottom: 40,
  },
  chapterEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
  chapterTitle: {
    fontSize: 31,
    fontWeight: "800",
    marginTop: 14,
  },
  sampleLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    marginTop: 12,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 10,
  },
  progressTrack: {
    height: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 10,
  },
  footerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 9,
  },
  pageCounter: {
    fontSize: 12,
    fontWeight: "700",
  },
  saveError: {
    color: "#E3A5A5",
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
  },
});