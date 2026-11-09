"""Development-only, repeatable seed for the StoryVerse catalog."""

import argparse
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_session_factory
from app.models.content import (
    Episode,
    EpisodeTranslation,
    Genre,
    Language,
    Story,
    StoryGenre,
    StoryTranslation,
)

EXPECTED_REVISION = "be46da2a5b42"

STORY_SLUG = "the-last-monsoon"
EPISODE_SLUG = "the-letter"

LANGUAGES = (
    ("en", "English", "English"),
    ("te", "Telugu", "తెలుగు"),
    ("hi", "Hindi", "हिन्दी"),
    ("ta", "Tamil", "தமிழ்"),
)

GENRES = (
    ("romance", "Romance"),
    ("drama", "Drama"),
    ("mystery", "Mystery"),
    ("fantasy", "Fantasy"),
    ("thriller", "Thriller"),
    ("horror", "Horror"),
    ("sci-fi", "Sci-Fi"),
)

FIXTURE_PATH = Path(__file__).resolve().parent / "fixtures" / "the_last_monsoon_ep1_en.txt"


def verify_environment(session: Session) -> None:
    settings = get_settings()

    if settings.environment != "development":
        raise RuntimeError("Seeding is restricted to development.")

    if settings.db_host not in {"localhost", "127.0.0.1", "::1"}:
        raise RuntimeError("A local PostgreSQL host is required.")

    if settings.db_name != "storyverse_db":
        raise RuntimeError("Unexpected configured database.")

    database = session.execute(text("SELECT current_database()")).scalar_one()

    if database != "storyverse_db":
        raise RuntimeError(f"Wrong connected database: {database}")

    revision = session.execute(text("SELECT version_num FROM alembic_version")).scalar_one()

    if revision != EXPECTED_REVISION:
        raise RuntimeError(f"Unexpected migration revision: {revision}")

    print("DATABASE:", database)
    print("MIGRATION:", revision)


def load_episode_text() -> str:
    if not FIXTURE_PATH.is_file():
        raise RuntimeError("The original episode fixture is missing.")

    body = FIXTURE_PATH.read_text(encoding="utf-8").strip()

    if len(body) < 3000 or not body.startswith("The rain arrived in Hyderabad"):
        raise RuntimeError("Episode fixture validation failed.")

    return body


def ensure_record(
    session: Session,
    model: type,
    identity: dict,
    values: dict,
    description: str,
) -> None:
    existing = session.get(model, identity)

    if existing is None:
        session.add(model(**identity, **values))
        session.flush()
        print("CREATED:", description)
        return

    mismatches = [
        field for field, expected in values.items() if getattr(existing, field) != expected
    ]

    if mismatches:
        raise RuntimeError(
            f"Existing {description} differs in {mismatches}. No existing data will be overwritten."
        )

    print("EXISTS:", description)


def seed_content(session: Session, body: str) -> None:
    for code, name, native_name in LANGUAGES:
        ensure_record(
            session,
            Language,
            {"code": code},
            {
                "name": name,
                "native_name": native_name,
                "is_active": True,
            },
            f"language {code}",
        )

    for slug, name in GENRES:
        ensure_record(
            session,
            Genre,
            {"slug": slug},
            {"name": name, "is_active": True},
            f"genre {slug}",
        )

    story = session.scalar(select(Story).where(Story.slug == STORY_SLUG))

    if story is None:
        story = Story(
            slug=STORY_SLUG,
            author_display_name="StoryVerse Editorial",
            original_language_code="en",
            cover_storage_key=None,
            status="published",
            published_at=datetime.now(timezone.utc),
        )

        session.add(story)
        session.flush()
        print("CREATED: The Last Monsoon")

    else:
        if (
            story.author_display_name != "StoryVerse Editorial"
            or story.original_language_code != "en"
            or story.status != "published"
        ):
            raise RuntimeError("Existing story differs. Refusing to overwrite.")

        print("EXISTS: The Last Monsoon")

    for genre_slug in ("romance", "drama", "mystery"):
        ensure_record(
            session,
            StoryGenre,
            {
                "story_id": story.id,
                "genre_slug": genre_slug,
            },
            {},
            f"story genre {genre_slug}",
        )

    ensure_record(
        session,
        StoryTranslation,
        {
            "story_id": story.id,
            "language_code": "en",
        },
        {
            "title": "The Last Monsoon",
            "tagline": "Some promises survive every storm.",
            "description": (
                "A heartfelt mystery about love, memories, and a letter that changes everything."
            ),
            "status": "published",
        },
        "English story translation",
    )

    episode = session.scalar(
        select(Episode).where(
            Episode.story_id == story.id,
            Episode.episode_number == 1,
        )
    )

    if episode is None:
        episode = Episode(
            story_id=story.id,
            episode_number=1,
            slug=EPISODE_SLUG,
            status="published",
            is_free=True,
            published_at=datetime.now(timezone.utc),
        )

        session.add(episode)
        session.flush()
        print("CREATED: Episode 1 - The Letter")

    else:
        if (
            episode.slug != EPISODE_SLUG
            or episode.status != "published"
            or episode.is_free is not True
        ):
            raise RuntimeError("Existing episode differs. Refusing to overwrite.")

        print("EXISTS: Episode 1 - The Letter")

    ensure_record(
        session,
        EpisodeTranslation,
        {
            "episode_id": episode.id,
            "language_code": "en",
        },
        {
            "title": "The Letter",
            "body_text": body,
            "status": "published",
        },
        "English episode reading content",
    )

    print("Audio records deferred until real assets are ready.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed local StoryVerse development content.")

    parser.add_argument(
        "--apply",
        action="store_true",
        help="Insert missing development content.",
    )

    args = parser.parse_args()
    body = load_episode_text()

    session_factory = get_session_factory(test=False)

    with session_factory() as session:
        with session.begin():
            verify_environment(session)

            if args.apply:
                seed_content(session, body)
            else:
                print("\nCURRENT CONTENT COUNTS:")

                for model in (
                    Language,
                    Genre,
                    Story,
                    Episode,
                    EpisodeTranslation,
                ):
                    count = session.scalar(select(func.count()).select_from(model))

                    print(f"{model.__tablename__}: {count}")

                print("\nSAMPLE STORY:", STORY_SLUG)
                print("SAMPLE EPISODE:", EPISODE_SLUG)
                print("READING CHARACTERS:", len(body))
                print("\nREAD-ONLY PREVIEW COMPLETE.")
                print("No database records were modified.")

    if args.apply:
        print("\nSTORYVERSE SEED TRANSACTION COMMITTED!")


if __name__ == "__main__":
    main()
