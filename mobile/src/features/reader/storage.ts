import Storage from "expo-sqlite/kv-store";

export type ReaderTheme = "night" | "sepia" | "paper";

export type ReaderFont = "serif" | "sans";

export interface ReaderPreferences {
  theme: ReaderTheme;
  font: ReaderFont;
  fontSize: number;
  lineHeight: number;
}

export interface EpisodeReadingProgress {
  storyId: string;
  episodeId: string;
  progress: number;
  updatedAt: string;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  theme: "night",
  font: "serif",
  fontSize: 18,
  lineHeight: 1.7,
};

const PREFERENCES_KEY = "storyverse.reader.preferences.v1";

const PROGRESS_PREFIX = "storyverse.reader.progress.v1:";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export async function loadReaderPreferences(): Promise<ReaderPreferences> {
  try {
    const raw = await Storage.getItem(PREFERENCES_KEY);

    if (!raw) {
      return { ...DEFAULT_READER_PREFERENCES };
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_READER_PREFERENCES };
    }

    const saved = parsed as Partial<ReaderPreferences>;

    return {
      theme:
        saved.theme === "night" ||
        saved.theme === "sepia" ||
        saved.theme === "paper"
          ? saved.theme
          : DEFAULT_READER_PREFERENCES.theme,

      font:
        saved.font === "serif" || saved.font === "sans"
          ? saved.font
          : DEFAULT_READER_PREFERENCES.font,

      fontSize:
        typeof saved.fontSize === "number" &&
        Number.isFinite(saved.fontSize)
          ? clamp(saved.fontSize, 14, 30)
          : DEFAULT_READER_PREFERENCES.fontSize,

      lineHeight:
        typeof saved.lineHeight === "number" &&
        Number.isFinite(saved.lineHeight)
          ? clamp(saved.lineHeight, 1.3, 2.2)
          : DEFAULT_READER_PREFERENCES.lineHeight,
    };
  } catch {
    return { ...DEFAULT_READER_PREFERENCES };
  }
}

export async function saveReaderPreferences(
  preferences: ReaderPreferences
): Promise<void> {
  await Storage.setItem(
    PREFERENCES_KEY,
    JSON.stringify(preferences)
  );
}

function progressKey(
  storyId: string,
  episodeId: string
): string {
  return `${PROGRESS_PREFIX}${storyId}:${episodeId}`;
}

export async function loadEpisodeProgress(
  storyId: string,
  episodeId: string
): Promise<EpisodeReadingProgress | null> {
  try {
    const raw = await Storage.getItem(
      progressKey(storyId, episodeId)
    );

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const saved = parsed as Partial<EpisodeReadingProgress>;

    if (
      saved.storyId !== storyId ||
      saved.episodeId !== episodeId ||
      typeof saved.progress !== "number" ||
      !Number.isFinite(saved.progress)
    ) {
      return null;
    }

    return {
      storyId,
      episodeId,
      progress: clamp(saved.progress, 0, 1),
      updatedAt:
        typeof saved.updatedAt === "string"
          ? saved.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveEpisodeProgress(
  storyId: string,
  episodeId: string,
  progress: number
): Promise<void> {
  if (!Number.isFinite(progress)) {
    throw new Error("Reading progress must be finite.");
  }

  const record: EpisodeReadingProgress = {
    storyId,
    episodeId,
    progress: clamp(progress, 0, 1),
    updatedAt: new Date().toISOString(),
  };

  await Storage.setItem(
    progressKey(storyId, episodeId),
    JSON.stringify(record)
  );
}