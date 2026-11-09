import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import get_db_session
from app.main import app
from app.models import (
    Base,
    Episode,
    EpisodeAudio,
    EpisodeTranslation,
    Language,
    Story,
    StoryTranslation,
)


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    Base.metadata.create_all(engine)

    session_factory = sessionmaker(
        bind=engine,
        expire_on_commit=False,
    )

    with session_factory() as db:
        db.add_all(
            [
                Language(
                    code="en",
                    name="English",
                    native_name="English",
                ),
                Language(
                    code="te",
                    name="Telugu",
                    native_name="Telugu",
                ),
            ]
        )

        db.flush()

        story = Story(
            slug="the-last-monsoon",
            author_display_name="StoryVerse",
            original_language_code="en",
            status="published",
        )

        draft_story = Story(
            slug="unpublished-story",
            author_display_name="StoryVerse",
            original_language_code="en",
            status="draft",
        )

        db.add_all([story, draft_story])
        db.flush()

        db.add_all(
            [
                StoryTranslation(
                    story_id=story.id,
                    language_code="en",
                    title="The Last Monsoon",
                    status="published",
                ),
                StoryTranslation(
                    story_id=story.id,
                    language_code="te",
                    title="Telugu Draft",
                    status="draft",
                ),
                StoryTranslation(
                    story_id=draft_story.id,
                    language_code="en",
                    title="Unpublished Story",
                    status="published",
                ),
            ]
        )

        cases = [
            (1, "published", True, "published", "published"),
            (2, "published", False, "published", "published"),
            (3, "draft", True, "published", "published"),
            (4, "published", True, "draft", "published"),
            (5, "published", True, "published", "draft"),
            (6, "published", True, "published", None),
        ]

        for number, episode_status, is_free, translation_status, audio_status in cases:
            episode = Episode(
                story_id=story.id,
                episode_number=number,
                slug=f"episode-{number}",
                status=episode_status,
                is_free=is_free,
            )

            db.add(episode)
            db.flush()

            db.add(
                EpisodeTranslation(
                    episode_id=episode.id,
                    language_code="en",
                    title=f"Episode {number}",
                    body_text=f"Reading content {number}",
                    status=translation_status,
                )
            )

            if audio_status is not None:
                db.add(
                    EpisodeAudio(
                        episode_id=episode.id,
                        language_code="en",
                        storage_key=f"private/episode-{number}.mp3",
                        mime_type="audio/mpeg",
                        duration_ms=180000,
                        narrator_name="StoryVerse Narrator",
                        status=audio_status,
                    )
                )

        db.commit()

    def override_database():
        with session_factory() as db:
            yield db

    app.dependency_overrides[get_db_session] = override_database

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db_session, None)
        engine.dispose()


def test_free_audio_metadata_is_safe(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/1/audio")

    assert response.status_code == 200

    data = response.json()

    assert data["story_slug"] == "the-last-monsoon"
    assert data["episode_number"] == 1
    assert data["language_code"] == "en"
    assert data["duration_ms"] == 180000
    assert data["mime_type"] == "audio/mpeg"

    assert "storage_key" not in data
    assert "playback_url" not in data
    assert "private/episode-1.mp3" not in response.text


def test_premium_audio_denied(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/2/audio")

    assert response.status_code == 403
    assert "private/episode-2.mp3" not in response.text


def test_draft_episode_not_found(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/3/audio")

    assert response.status_code == 404


def test_unpublished_episode_translation_not_found(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/4/audio")

    assert response.status_code == 404


def test_draft_audio_not_found(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/5/audio")

    assert response.status_code == 404


def test_missing_audio_not_found(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/6/audio")

    assert response.status_code == 404


def test_draft_story_not_found(client):
    response = client.get("/api/v1/stories/unpublished-story/episodes/1/audio")

    assert response.status_code == 404


def test_unpublished_language_not_found(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/1/audio?language=te")

    assert response.status_code == 404


def test_unknown_episode_not_found(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/99/audio")

    assert response.status_code == 404


def test_invalid_episode_number_rejected(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/0/audio")

    assert response.status_code == 422


def test_audio_openapi_does_not_expose_storage_key(client):
    schema = client.get("/openapi.json")

    assert schema.status_code == 200

    audio_schema = schema.json()["components"]["schemas"]["EpisodeAudioMetadata"]

    properties = audio_schema["properties"]

    assert "storage_key" not in properties
    assert "playback_url" not in properties
