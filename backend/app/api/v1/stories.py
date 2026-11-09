from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.models.content import (
    Episode,
    Genre,
    Language,
    Story,
    StoryGenre,
    StoryTranslation,
)
from app.schemas.stories import StoryDetail, StoryPage, StorySummary

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
) -> dict[UUID, int]:
    if not story_ids:
        return {}

    rows = db.execute(
        select(Episode.story_id, func.count(Episode.id))
        .where(
            Episode.story_id.in_(story_ids),
            Episode.status == "published",
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
    counts = _episode_counts(db, story_ids)

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
    counts = _episode_counts(db, [story.id])

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
