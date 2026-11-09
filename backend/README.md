# StoryVerse Backend

FastAPI backend for the StoryVerse reading and audiobook platform.

## Development

Requires Python 3.12.

Install dependencies:

    py -3.12 -m venv .venv
    .\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt

Run tests:

    .\.venv\Scripts\python.exe -m pytest

Run the development API:

    .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload

Health endpoint:

    http://127.0.0.1:8000/api/v1/health

API documentation:

    http://127.0.0.1:8000/docs

Database integration will be added in Phase 2C.2.