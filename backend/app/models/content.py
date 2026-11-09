from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Language(Base):
    __tablename__ = "languages"

    code: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    native_name: Mapped[str] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("true"),
    )


class Genre(Base):
    __tablename__ = "genres"

    slug: Mapped[str] = mapped_column(String(60), primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("true"),
    )


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    author_display_name: Mapped[str] = mapped_column(String(160))
    original_language_code: Mapped[str] = mapped_column(
        String(16),
        ForeignKey("languages.code"),
    )
    cover_storage_key: Mapped[str | None] = mapped_column(String(512))
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="draft",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'published', 'archived')",
            name="valid_status",
        ),
        Index("ix_stories_status_published_at", "status", "published_at"),
    )


class StoryGenre(Base):
    __tablename__ = "story_genres"

    story_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("stories.id"),
        primary_key=True,
    )
    genre_slug: Mapped[str] = mapped_column(
        String(60),
        ForeignKey("genres.slug"),
        primary_key=True,
    )


class StoryTranslation(Base):
    __tablename__ = "story_translations"

    story_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("stories.id"),
        primary_key=True,
    )
    language_code: Mapped[str] = mapped_column(
        String(16),
        ForeignKey("languages.code"),
        primary_key=True,
    )
    title: Mapped[str] = mapped_column(String(200))
    tagline: Mapped[str | None] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="draft",
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'published')",
            name="valid_status",
        ),
    )


class Episode(Base):
    __tablename__ = "episodes"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    story_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("stories.id"),
    )
    episode_number: Mapped[int] = mapped_column(Integer)
    slug: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="draft",
    )
    is_free: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    __table_args__ = (
        UniqueConstraint(
            "story_id",
            "episode_number",
            name="uq_episodes_story_number",
        ),
        UniqueConstraint(
            "story_id",
            "slug",
            name="uq_episodes_story_slug",
        ),
        CheckConstraint(
            "episode_number > 0",
            name="positive_episode_number",
        ),
        CheckConstraint(
            "status IN ('draft', 'published', 'archived')",
            name="valid_status",
        ),
    )


class EpisodeTranslation(Base):
    __tablename__ = "episode_translations"

    episode_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("episodes.id"),
        primary_key=True,
    )
    language_code: Mapped[str] = mapped_column(
        String(16),
        ForeignKey("languages.code"),
        primary_key=True,
    )
    title: Mapped[str] = mapped_column(String(200))
    body_text: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="draft",
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'published')",
            name="valid_status",
        ),
    )


class EpisodeAudio(Base):
    __tablename__ = "episode_audio"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    episode_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("episodes.id"),
    )
    language_code: Mapped[str] = mapped_column(
        String(16),
        ForeignKey("languages.code"),
    )
    storage_key: Mapped[str] = mapped_column(String(512))
    mime_type: Mapped[str] = mapped_column(String(80))
    duration_ms: Mapped[int] = mapped_column(Integer)
    narrator_name: Mapped[str | None] = mapped_column(String(160))
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="draft",
    )

    __table_args__ = (
        UniqueConstraint(
            "episode_id",
            "language_code",
            name="uq_episode_audio_language",
        ),
        CheckConstraint(
            "duration_ms > 0",
            name="positive_duration",
        ),
        CheckConstraint(
            "status IN ('draft', 'published')",
            name="valid_status",
        ),
    )