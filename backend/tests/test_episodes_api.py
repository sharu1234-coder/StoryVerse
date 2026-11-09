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

        published_story = Story(
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

        db.add_all([published_story, draft_story])
        db.flush()

        db.add_all(
            [
                StoryTranslation(
                    story_id=published_story.id,
                    language_code="en",
                    title="The Last Monsoon",
                    status="published",
                ),
                StoryTranslation(
                    story_id=published_story.id,
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

        episodes = [
            Episode(
                story_id=published_story.id,
                episode_number=1,
                slug="episode-1",
                status="published",
                is_free=True,
            ),
            Episode(
                story_id=published_story.id,
                episode_number=2,
                slug="episode-2",
                status="published",
                is_free=False,
            ),
            Episode(
                story_id=published_story.id,
                episode_number=3,
                slug="episode-3",
                status="draft",
                is_free=True,
            ),
            Episode(
                story_id=published_story.id,
                episode_number=4,
                slug="episode-4",
                status="published",
                is_free=True,
            ),
            Episode(
                story_id=published_story.id,
                episode_number=5,
                slug="episode-5",
                status="published",
                is_free=True,
            ),
        ]

        db.add_all(episodes)
        db.flush()

        db.add_all(
            [
                EpisodeTranslation(
                    episode_id=episodes[0].id,
                    language_code="en",
                    title="The First Rain",
                    body_text="The rain began at midnight.",
                    status="published",
                ),
                EpisodeTranslation(
                    episode_id=episodes[1].id,
                    language_code="en",
                    title="The Hidden Letter",
                    body_text="This is private premium content.",
                    status="published",
                ),
                EpisodeTranslation(
                    episode_id=episodes[2].id,
                    language_code="en",
                    title="Unpublished Episode",
                    body_text="Unpublished content.",
                    status="published",
                ),
                EpisodeTranslation(
                    episode_id=episodes[3].id,
                    language_code="en",
                    title="Draft Translation",
                    body_text="Unpublished translation text.",
                    status="draft",
                ),
                EpisodeTranslation(
                    episode_id=episodes[4].id,
                    language_code="en",
                    title="Audio Only",
                    body_text=None,
                    status="published",
                ),
            ]
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


def test_only_published_translated_episodes_are_listed(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes")

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 3
    assert [item["episode_number"] for item in data["items"]] == [1, 2, 5]


def test_free_episode_can_be_read(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/1")

    assert response.status_code == 200

    data = response.json()

    assert data["episode_number"] == 1
    assert data["is_free"] is True
    assert data["body_text"] == "The rain began at midnight."


def test_premium_episode_is_protected(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/2")

    assert response.status_code == 403

    assert "private premium content" not in response.text.lower()


def test_draft_episode_is_hidden(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/3")

    assert response.status_code == 404


def test_unpublished_episode_translation_is_hidden(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/4")

    assert response.status_code == 404


def test_missing_reading_content_returns_404(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/5")

    assert response.status_code == 404


def test_draft_story_episodes_are_hidden(client):
    response = client.get("/api/v1/stories/unpublished-story/episodes")

    assert response.status_code == 404


def test_unpublished_language_is_hidden(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes?language=te")

    assert response.status_code == 404


def test_episode_pagination(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes?limit=2&offset=1")

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 3
    assert [item["episode_number"] for item in data["items"]] == [2, 5]


def test_unknown_episode_returns_404(client):
    response = client.get("/api/v1/stories/the-last-monsoon/episodes/99")

    assert response.status_code == 404


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/stories/the-last-monsoon/episodes/0",
        "/api/v1/stories/the-last-monsoon/episodes?limit=0",
        "/api/v1/stories/the-last-monsoon/episodes?offset=-1",
    ],
)
def test_invalid_episode_parameters(client, path):
    response = client.get(path)

    assert response.status_code == 422


def test_catalog_episode_count_matches_listing(client):
    story_response = client.get("/api/v1/stories/the-last-monsoon")

    episodes_response = client.get("/api/v1/stories/the-last-monsoon/episodes")

    assert story_response.status_code == 200
    assert episodes_response.status_code == 200

    story_count = story_response.json()["episode_count"]
    episode_count = episodes_response.json()["total"]

    assert story_count == episode_count == 3
