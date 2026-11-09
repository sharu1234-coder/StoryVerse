from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.models.content import (
    Episode,
    EpisodeAudio,
    EpisodeTranslation,
    Genre,
    Language,
    Story,
    StoryGenre,
    StoryTranslation,
)
from app.schemas.stories import (
    EpisodeAudioMetadata,
    EpisodePage,
    EpisodeReading,
    EpisodeSummary,
    StoryDetail,
    StoryPage,
    StorySummary,
)

router = APIRouter(prefix="/stories", tags=["stories"])

LanguageQuery = Annotated[
    str,
    Query(min_length=2, max_length=16, pattern=r"^[a-z]{2}(?:-[A-Z]{2})?$"),
]


def _visible_stories_query(language: str, genre: str | None = None):
    statement = (
        select(Story, StoryTranslation)
        .join(
            StoryTranslation,
            StoryTranslation.story_id == Story.id,
        )
        .join(
            Language,
            Language.code == StoryTranslation.language_code,
        )
        .where(
            Story.status == "published",
            StoryTranslation.status == "published",
            StoryTranslation.language_code == language,
            Language.is_active.is_(True),
        )
    )

    if genre is not None:
        statement = (
            statement.join(StoryGenre, StoryGenre.story_id == Story.id)
            .join(Genre, Genre.slug == StoryGenre.genre_slug)
            .where(
                Genre.slug == genre,
                Genre.is_active.is_(True),
            )
        )

    return statement


def _genres_by_story(
    db: Session,
    story_ids: list[UUID],
) -> dict[UUID, list[str]]:
    if not story_ids:
        return {}

    rows = db.execute(
        select(StoryGenre.story_id, Genre.slug)
        .join(Genre, Genre.slug == StoryGenre.genre_slug)
        .where(
            StoryGenre.story_id.in_(story_ids),
            Genre.is_active.is_(True),
        )
        .order_by(Genre.slug)
    ).all()

    result: dict[UUID, list[str]] = {story_id: [] for story_id in story_ids}

    for story_id, genre_slug in rows:
        result[story_id].append(genre_slug)

    return result


def _episode_counts(
    db: Session,
    story_ids: list[UUID],
    language: str,
) -> dict[UUID, int]:
    if not story_ids:
        return {}

    rows = db.execute(
        select(Episode.story_id, func.count(Episode.id))
        .join(
            EpisodeTranslation,
            EpisodeTranslation.episode_id == Episode.id,
        )
        .where(
            Episode.story_id.in_(story_ids),
            Episode.status == "published",
            EpisodeTranslation.status == "published",
            EpisodeTranslation.language_code == language,
        )
        .group_by(Episode.story_id)
    ).all()

    return {story_id: count for story_id, count in rows}


def _summary(
    story: Story,
    translation: StoryTranslation,
    genres: list[str],
    episode_count: int,
) -> StorySummary:
    return StorySummary(
        slug=story.slug,
        title=translation.title,
        tagline=translation.tagline,
        author_display_name=story.author_display_name,
        language_code=translation.language_code,
        genres=genres,
        episode_count=episode_count,
    )


@router.get("", response_model=StoryPage)
def list_stories(
    language: LanguageQuery = "en",
    genre: Annotated[
        str | None,
        Query(
            max_length=60,
            pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        ),
    ] = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
    db: Session = Depends(get_db_session),
) -> StoryPage:
    statement = _visible_stories_query(language, genre)

    total = db.scalar(select(func.count()).select_from(statement.subquery())) or 0

    rows = db.execute(statement.order_by(Story.slug).limit(limit).offset(offset)).all()

    story_ids = [story.id for story, _ in rows]
    genres_by_story = _genres_by_story(db, story_ids)
    counts = _episode_counts(db, story_ids, language)

    items = [
        _summary(
            story,
            translation,
            genres_by_story.get(story.id, []),
            counts.get(story.id, 0),
        )
        for story, translation in rows
    ]

    return StoryPage(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{slug}", response_model=StoryDetail)
def get_story(
    slug: str,
    language: LanguageQuery = "en",
    db: Session = Depends(get_db_session),
) -> StoryDetail:
    row = db.execute(_visible_stories_query(language).where(Story.slug == slug)).one_or_none()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Story not found",
        )

    story, translation = row

    genres_by_story = _genres_by_story(db, [story.id])
    counts = _episode_counts(db, [story.id], language)

    summary = _summary(
        story,
        translation,
        genres_by_story.get(story.id, []),
        counts.get(story.id, 0),
    )

    return StoryDetail(
        **summary.model_dump(),
        description=translation.description,
        published_at=story.published_at,
    )


def _public_story_for_language(
    db: Session,
    slug: str,
    language: str,
) -> Story:
    row = db.execute(_visible_stories_query(language).where(Story.slug == slug)).one_or_none()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Story not found",
        )

    return row[0]


def _visible_episodes_query(
    story_id: UUID,
    language: str,
):
    return (
        select(Episode, EpisodeTranslation)
        .join(
            EpisodeTranslation,
            EpisodeTranslation.episode_id == Episode.id,
        )
        .where(
            Episode.story_id == story_id,
            Episode.status == "published",
            EpisodeTranslation.status == "published",
            EpisodeTranslation.language_code == language,
        )
    )


def _episode_summary(
    episode: Episode,
    translation: EpisodeTranslation,
) -> EpisodeSummary:
    return EpisodeSummary(
        episode_number=episode.episode_number,
        slug=episode.slug,
        title=translation.title,
        language_code=translation.language_code,
        is_free=episode.is_free,
    )


@router.get("/{slug}/episodes", response_model=EpisodePage)
def list_episodes(
    slug: str,
    language: LanguageQuery = "en",
    limit: Annotated[int, Query(ge=1, le=100)] = 30,
    offset: Annotated[int, Query(ge=0)] = 0,
    db: Session = Depends(get_db_session),
) -> EpisodePage:
    story = _public_story_for_language(db, slug, language)

    statement = _visible_episodes_query(
        story.id,
        language,
    )

    total = db.scalar(select(func.count()).select_from(statement.subquery())) or 0

    rows = db.execute(statement.order_by(Episode.episode_number).limit(limit).offset(offset)).all()

    return EpisodePage(
        story_slug=story.slug,
        language_code=language,
        items=[_episode_summary(episode, translation) for episode, translation in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{slug}/episodes/{episode_number}",
    response_model=EpisodeReading,
)
def read_episode(
    slug: str,
    episode_number: Annotated[int, Path(ge=1)],
    language: LanguageQuery = "en",
    db: Session = Depends(get_db_session),
) -> EpisodeReading:
    story = _public_story_for_language(db, slug, language)

    row = db.execute(
        _visible_episodes_query(
            story.id,
            language,
        ).where(Episode.episode_number == episode_number)
    ).one_or_none()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Episode not found",
        )

    episode, translation = row

    if not episode.is_free:
        raise HTTPException(
            status_code=403,
            detail="Premium episode requires access",
        )

    if not translation.body_text or not translation.body_text.strip():
        raise HTTPException(
            status_code=404,
            detail="Reading content not available",
        )

    summary = _episode_summary(
        episode,
        translation,
    )

    return EpisodeReading(
        **summary.model_dump(),
        body_text=translation.body_text,
    )


@router.get(
    "/{slug}/episodes/{episode_number}/audio",
    response_model=EpisodeAudioMetadata,
)
def get_episode_audio(
    slug: str,
    episode_number: Annotated[int, Path(ge=1)],
    language: LanguageQuery = "en",
    db: Session = Depends(get_db_session),
) -> EpisodeAudioMetadata:
    story = _public_story_for_language(
        db,
        slug,
        language,
    )

    row = db.execute(
        _visible_episodes_query(
            story.id,
            language,
        ).where(Episode.episode_number == episode_number)
    ).one_or_none()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Episode not found",
        )

    episode, translation = row

    if not episode.is_free:
        raise HTTPException(
            status_code=403,
            detail="Premium audiobook requires access",
        )

    audio = db.scalar(
        select(EpisodeAudio).where(
            EpisodeAudio.episode_id == episode.id,
            EpisodeAudio.language_code == language,
            EpisodeAudio.status == "published",
        )
    )

    if audio is None:
        raise HTTPException(
            status_code=404,
            detail="Audiobook not available",
        )

    return EpisodeAudioMetadata(
        story_slug=story.slug,
        episode_number=episode.episode_number,
        language_code=language,
        title=translation.title,
        duration_ms=audio.duration_ms,
        mime_type=audio.mime_type,
        narrator_name=audio.narrator_name,
    )
