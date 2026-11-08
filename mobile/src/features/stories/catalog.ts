import type { Story, StoryEpisode, StoryLanguage } from "./types";
import { READER_DEMO_PAGES } from "../reader/demo";

export const MIN_EPISODES_PER_STORY = 12;

function createDraftEpisodes(
  storyId: string,
  titles: readonly string[]
): StoryEpisode[] {
  if (titles.length < MIN_EPISODES_PER_STORY) {
    throw new Error(
      `${storyId} requires at least ${MIN_EPISODES_PER_STORY} episodes`
    );
  }

  return titles.map((title, index) => ({
    id: `${storyId}-episode-${index + 1}`,
    number: index + 1,
    title,
    summary: "Episode content is currently in editorial development.",
    availability: "planned",
    access: index < 2 ? "free" : "premium",
    estimatedReadingMinutes: 10,
    text: null,
    audio: null,
  }));
}

const LAST_MONSOON_EPISODES = [
  "The Letter",
  "Rain Over Hyderabad",
  "A Familiar Stranger",
  "The Forgotten Photograph",
  "Letters Never Sent",
  "A Secret in the Attic",
  "The Railway Platform",
  "The Promise",
  "A City of Memories",
  "When the Rains Return",
  "The Last Goodbye",
  "After the Monsoon",
] as const;

const FORGOTTEN_KINGDOM_EPISODES = [
  "The Hidden Map",
  "The Temple Beyond the Hills",
  "The Guardian's Warning",
  "The Ancient Inscription",
  "The Lost Prince",
  "A Kingdom Beneath the Earth",
  "The Betrayal",
  "The Sacred Weapon",
  "The Forgotten Queen",
  "The Siege",
  "The Final Prophecy",
  "The Kingdom Awakens",
] as const;

const MIDNIGHT_CALL_EPISODES = [
  "The First Call",
  "Unknown Number",
  "The Empty Apartment",
  "Voices in the Dark",
  "The Missing Woman",
  "The Recording",
  "A Stranger's Confession",
  "The Underground Passage",
  "The Final Witness",
  "Midnight Again",
  "The Truth",
  "The Last Ring",
] as const;

const ROOM_404_EPISODES = [
  "Check-In",
  "The Locked Corridor",
  "Footsteps at Midnight",
  "The Guest Register",
  "The Missing Key",
  "The Mirror",
  "An Unwelcome Visitor",
  "The Fourth Floor",
  "The Night Manager",
  "The Room That Vanished",
  "The Final Door",
  "Check-Out",
] as const;

export const PREVIEW_STORIES: Story[] = [
  {
    id: "the-last-monsoon",
    title: "The Last Monsoon",
    subtitle: "Some promises survive every storm.",
    description:
      "A heartfelt mystery about love, memories, and a letter that changes everything.",
    language: "en",
    genres: ["Romance", "Drama", "Mystery"],
    authorName: "StoryVerse Editorial",
    ageRating: "13+",
    status: "preview",
    coverColors: ["#765270", "#241D39"],
    episodes: createDraftEpisodes(
      "the-last-monsoon",
      LAST_MONSOON_EPISODES
    ).map((episode) =>
      episode.number === 1
        ? {
            ...episode,
            availability: "sample",
            summary:
              "A mysterious letter reopens a seven-year-old disappearance.",
            estimatedReadingMinutes: 8,
            text: READER_DEMO_PAGES.join("\n\n"),
          }
        : episode
    ),
  },
  {
    id: "the-forgotten-kingdom",
    title: "The Forgotten Kingdom",
    subtitle: "Every legend begins with a secret.",
    description:
      "An epic fantasy adventure inspired by the atmosphere of ancient kingdoms and forgotten legends.",
    language: "te",
    genres: ["Fantasy", "Adventure", "Mythology"],
    authorName: "StoryVerse Editorial",
    ageRating: "13+",
    status: "preview",
    coverColors: ["#79603C", "#24192A"],
    episodes: createDraftEpisodes(
      "the-forgotten-kingdom",
      FORGOTTEN_KINGDOM_EPISODES
    ),
  },
  {
    id: "the-midnight-call",
    title: "The Midnight Call",
    subtitle: "Some calls should never be answered.",
    description:
      "A suspense thriller about a mysterious phone call and a disappearance nobody can explain.",
    language: "hi",
    genres: ["Thriller", "Mystery", "Crime"],
    authorName: "StoryVerse Editorial",
    ageRating: "16+",
    status: "preview",
    coverColors: ["#354F74", "#14172D"],
    episodes: createDraftEpisodes(
      "the-midnight-call",
      MIDNIGHT_CALL_EPISODES
    ),
  },
  {
    id: "room-404",
    title: "Room 404",
    subtitle: "The room exists. The guests do not.",
    description:
      "A supernatural mystery set inside a hotel where one room appears to have been erased from every record.",
    language: "ta",
    genres: ["Horror", "Supernatural", "Mystery"],
    authorName: "StoryVerse Editorial",
    ageRating: "16+",
    status: "preview",
    coverColors: ["#704049", "#1D1928"],
    episodes: createDraftEpisodes(
      "room-404",
      ROOM_404_EPISODES
    ),
  },
];

export function getStoryById(id: string): Story | undefined {
  return PREVIEW_STORIES.find((story) => story.id === id);
}

export function getStoriesByLanguage(
  language: StoryLanguage
): Story[] {
  return PREVIEW_STORIES.filter(
    (story) => story.language === language
  );
}

export function getStoriesByGenre(genre: string): Story[] {
  return PREVIEW_STORIES.filter((story) =>
    story.genres.some(
      (item) => item.toLowerCase() === genre.toLowerCase()
    )
  );
}