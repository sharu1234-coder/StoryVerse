import type { Story } from "./types";
import { MIN_EPISODES_PER_STORY } from "./catalog";

export function getStoryPublicationBlockers(
  story: Story
): string[] {
  const blockers: string[] = [];

  if (story.episodes.length < MIN_EPISODES_PER_STORY) {
    blockers.push(
      `Story requires at least ${MIN_EPISODES_PER_STORY} episodes.`
    );
  }

  const episodeNumbers = new Set<number>();

  for (const episode of story.episodes) {
    if (
      !Number.isInteger(episode.number) ||
      episode.number < 1 ||
      episodeNumbers.has(episode.number)
    ) {
      blockers.push(
        `Episode ${episode.id} has an invalid or duplicate number.`
      );
    }

    episodeNumbers.add(episode.number);

    if (episode.availability !== "ready") {
      blockers.push(`Episode ${episode.number} is not ready.`);
    }

    if (!episode.text?.trim()) {
      blockers.push(
        `Episode ${episode.number} has no reading text.`
      );
    }

    if (
      !episode.audio?.url.trim() ||
      !Number.isFinite(episode.audio.durationSeconds) ||
      episode.audio.durationSeconds <= 0
    ) {
      blockers.push(
        `Episode ${episode.number} has no valid audio.`
      );
    }
  }

  return blockers;
}

export function isStoryPublishable(story: Story): boolean {
  return getStoryPublicationBlockers(story).length === 0;
}