from fastapi import FastAPI

from app.api.v1.health import router as health_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()

    application = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="StoryVerse reading and audiobook platform API.",
        docs_url="/docs" if settings.environment != "production" else None,
        redoc_url=None,
    )

    application.include_router(
        health_router,
        prefix=settings.api_prefix,
    )

    return application


app = create_app()