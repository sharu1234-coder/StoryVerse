export type StoryLanguage = "en" | "te" | "hi" | "ta";

export type StoryStatus = "preview" | "published";

export type EpisodeAvailability = "planned" | "sample" | "ready";

export type EpisodeAccess = "free" | "premium";

export type StoryAgeRating = "all" | "13+" | "16+" | "18+";

export interface EpisodeAudio {
  url: string;
  durationSeconds: number;
  voiceId: string | null;
}

export interface StoryEpisode {
  id: string;
  number: number;
  title: string;
  summary: string;
  availability: EpisodeAvailability;
  access: EpisodeAccess;
  estimatedReadingMinutes: number;
  text: string | null;
  audio: EpisodeAudio | null;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  language: StoryLanguage;
  genres: string[];
  authorName: string;
  ageRating: StoryAgeRating;
  status: StoryStatus;
  coverColors: [string, string];
  episodes: StoryEpisode[];
}