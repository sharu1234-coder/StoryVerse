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
