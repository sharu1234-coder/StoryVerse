from pydantic import SecretStr

from app.core.config import Settings
from app.db.session import build_database_url


def test_development_and_test_databases_are_isolated() -> None:
    settings = Settings(
        db_name="storyverse_db",
        db_test_name="storyverse_test_db",
        db_password=SecretStr("test-password"),
    )

    development_url = build_database_url(settings)
    test_url = build_database_url(settings, test=True)

    assert development_url.database == "storyverse_db"
    assert test_url.database == "storyverse_test_db"
    assert development_url.database != test_url.database


def test_special_characters_in_password_are_preserved() -> None:
    password = "Example@Password:#/123"

    settings = Settings(
        db_password=SecretStr(password),
    )

    database_url = build_database_url(settings)

    assert database_url.password == password
    assert password not in str(database_url)