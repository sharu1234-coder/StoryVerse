from datetime import datetime

from pydantic import BaseModel


class StorySummary(BaseModel):
    slug: str
    title: str
    tagline: str | None
    author_display_name: str
    language_code: str
    genres: list[str]
    episode_count: int


class StoryDetail(StorySummary):
    description: str | None
    published_at: datetime | None


class StoryPage(BaseModel):
    items: list[StorySummary]
    total: int
    limit: int
    offset: int


class EpisodeSummary(BaseModel):
    episode_number: int
    slug: str
    title: str
    language_code: str
    is_free: bool


class EpisodePage(BaseModel):
    story_slug: str
    language_code: str
    items: list[EpisodeSummary]
    total: int
    limit: int
    offset: int


class EpisodeReading(EpisodeSummary):
    body_text: str
