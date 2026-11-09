import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import get_db_session
from app.main import app
from app.models import (
    Base,
    Episode,
    EpisodeTranslation,
    Genre,
    Language,
    Story,
    StoryGenre,
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
                Genre(
                    slug="romance",
                    name="Romance",
                ),
            ]
        )

        db.flush()

        published = Story(
            slug="the-last-monsoon",
            author_display_name="StoryVerse",
            original_language_code="en",
            status="published",
        )

        draft = Story(
            slug="hidden-draft",
            author_display_name="StoryVerse",
            original_language_code="en",
            status="draft",
        )

        translation_draft = Story(
            slug="translation-draft",
            author_display_name="StoryVerse",
            original_language_code="en",
            status="published",
        )

        db.add_all([published, draft, translation_draft])

        db.flush()

        db.add_all(
            [
                StoryTranslation(
                    story_id=published.id,
                    language_code="en",
                    title="The Last Monsoon",
                    tagline="Some promises survive every storm.",
                    description="An original romance story.",
                    status="published",
                ),
                StoryTranslation(
                    story_id=published.id,
                    language_code="te",
                    title="Telugu Draft",
                    status="draft",
                ),
                StoryTranslation(
                    story_id=draft.id,
                    language_code="en",
                    title="Hidden Draft Story",
                    status="published",
                ),
                StoryTranslation(
                    story_id=translation_draft.id,
                    language_code="en",
                    title="Unpublished Translation",
                    status="draft",
                ),
                StoryGenre(
                    story_id=published.id,
                    genre_slug="romance",
                ),
                Episode(
                    story_id=published.id,
                    episode_number=1,
                    slug="episode-1",
                    status="published",
                    is_free=True,
                ),
                Episode(
                    story_id=published.id,
                    episode_number=2,
                    slug="episode-2",
                    status="draft",
                    is_free=True,
                ),
            ]
        )

        db.flush()

        first_episode = db.scalar(
            select(Episode).where(
                Episode.story_id == published.id,
                Episode.episode_number == 1,
            )
        )

        assert first_episode is not None

        db.add(
            EpisodeTranslation(
                episode_id=first_episode.id,
                language_code="en",
                title="Episode One",
                body_text="A rainy beginning.",
                status="published",
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


def test_published_stories_are_visible(client):
    response = client.get("/api/v1/stories")

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["slug"] == "the-last-monsoon"
    assert data["items"][0]["title"] == "The Last Monsoon"


def test_draft_stories_are_hidden(client):
    response = client.get("/api/v1/stories/hidden-draft")

    assert response.status_code == 404


def test_unpublished_story_translations_are_hidden(client):
    response = client.get("/api/v1/stories/translation-draft")

    assert response.status_code == 404


def test_story_details_and_episode_count(client):
    response = client.get("/api/v1/stories/the-last-monsoon")

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "The Last Monsoon"
    assert data["language_code"] == "en"
    assert data["genres"] == ["romance"]
    assert data["episode_count"] == 1
    assert data["description"] == "An original romance story."


def test_unpublished_language_is_hidden(client):
    response = client.get("/api/v1/stories?language=te")

    assert response.status_code == 200
    assert response.json()["total"] == 0

    detail = client.get("/api/v1/stories/the-last-monsoon?language=te")

    assert detail.status_code == 404


def test_genre_filtering(client):
    romance = client.get("/api/v1/stories?genre=romance")

    fantasy = client.get("/api/v1/stories?genre=fantasy")

    assert romance.status_code == 200
    assert romance.json()["total"] == 1

    assert fantasy.status_code == 200
    assert fantasy.json()["total"] == 0


def test_pagination(client):
    response = client.get("/api/v1/stories?limit=1&offset=1")

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert data["items"] == []
    assert data["limit"] == 1
    assert data["offset"] == 1


@pytest.mark.parametrize(
    "query",
    [
        "limit=0",
        "limit=51",
        "offset=-1",
    ],
)
def test_invalid_pagination_is_rejected(client, query):
    response = client.get(f"/api/v1/stories?{query}")

    assert response.status_code == 422
