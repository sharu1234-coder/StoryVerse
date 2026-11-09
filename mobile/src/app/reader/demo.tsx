import StoryVerseReader from "../../components/storyverse-reader";

import {
  READER_DEMO_EPISODE_ID,
  READER_DEMO_PAGES,
  READER_DEMO_STORY_ID,
  READER_DEMO_TITLE,
} from "../../features/reader/demo";

export default function ReaderDemoScreen() {
  return (
    <StoryVerseReader
      storyId={READER_DEMO_STORY_ID}
      episodeId={READER_DEMO_EPISODE_ID}
      storyTitle="The Last Monsoon"
      episodeTitle={READER_DEMO_TITLE}
      pages={READER_DEMO_PAGES}
      isSample
    />
  );
}