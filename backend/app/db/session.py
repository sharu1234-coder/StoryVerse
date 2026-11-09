from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import URL, Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings


def build_database_url(
    settings: Settings,
    *,
    test: bool = False,
) -> URL:
    if settings.db_password is None:
        raise RuntimeError("StoryVerse database password is not configured.")

    database_name = (
        settings.db_test_name
        if test
        else settings.db_name
    )

    return URL.create(
        drivername="postgresql+psycopg",
        username=settings.db_user,
        password=settings.db_password.get_secret_value(),
        host=settings.db_host,
        port=settings.db_port,
        database=database_name,
    )


@lru_cache(maxsize=2)
def get_engine(test: bool = False) -> Engine:
    settings = get_settings()

    database_url = build_database_url(
        settings,
        test=test,
    )

    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=3,
        max_overflow=2,
        pool_timeout=30,
        connect_args={"connect_timeout": 5},
        hide_parameters=True,
    )


@lru_cache(maxsize=2)
def get_session_factory(
    test: bool = False,
) -> sessionmaker[Session]:
    return sessionmaker(
        bind=get_engine(test=test),
        autoflush=False,
        expire_on_commit=False,
    )


def get_db_session() -> Iterator[Session]:
    session_factory = get_session_factory()

    with session_factory() as session:
        yield session