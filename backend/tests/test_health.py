from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "storyverse-api",
    }


def test_openapi_documentation() -> None:
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert response.json()["info"]["title"] == "StoryVerse API"


def test_unknown_endpoint_returns_404() -> None:
    response = client.get("/api/v1/unknown")

    assert response.status_code == 404