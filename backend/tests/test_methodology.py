import sys
import os
import uuid
from datetime import date

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import pytest_asyncio
from fastapi.testclient import TestClient

from main import app
from database.models import MethodologyVersion


client = TestClient(app)


# =========================================================
# FIXTURES
# =========================================================

@pytest_asyncio.fixture
async def old_methodology(db_session):
    methodology = MethodologyVersion(
        id=uuid.uuid4(),
        version="2025.1",
        title="AUR Methodology 2025",
        description="Previous methodology version",
        release_date=date(2025, 6, 1),
        is_current=False,
    )

    db_session.add(methodology)
    await db_session.commit()
    await db_session.refresh(methodology)

    return methodology


@pytest_asyncio.fixture
async def current_methodology(db_session):
    methodology = MethodologyVersion(
        id=uuid.uuid4(),
        version="2026.1",
        title="AUR Methodology 2026",
        description="Current methodology version",
        release_date=date(2026, 6, 1),
        is_current=True,
    )

    db_session.add(methodology)
    await db_session.commit()
    await db_session.refresh(methodology)

    return methodology


@pytest_asyncio.fixture
async def latest_methodology(db_session):
    methodology = MethodologyVersion(
        id=uuid.uuid4(),
        version="2027.1",
        title="AUR Methodology 2027",
        description="Future methodology version",
        release_date=date(2027, 6, 1),
        is_current=False,
    )

    db_session.add(methodology)
    await db_session.commit()
    await db_session.refresh(methodology)

    return methodology


# =========================================================
# GET /api/methodology/version-history
# =========================================================

def test_version_history_empty():
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200
    assert response.json() == []


def test_version_history_success(
    current_methodology,
):
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 1


def test_version_history_structure(
    current_methodology,
):
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200

    data = response.json()

    methodology = data[0]

    required_fields = [
        "id",
        "version",
        "title",
        "description",
        "release_date",
        "is_current",
        "created_at",
    ]

    for field in required_fields:
        assert field in methodology


def test_version_history_values(
    current_methodology,
):
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200

    data = response.json()[0]

    assert (
        data["id"]
        == str(current_methodology.id)
    )

    assert data["version"] == "2026.1"

    assert (
        data["title"]
        == "AUR Methodology 2026"
    )

    assert (
        data["description"]
        == "Current methodology version"
    )

    assert (
        data["release_date"]
        == "2026-06-01"
    )

    assert data["is_current"] is True


def test_version_history_ordered_latest_first(
    old_methodology,
    current_methodology,
    latest_methodology,
):
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200

    data = response.json()

    versions = [
        item["version"]
        for item in data
    ]

    assert versions == [
        "2027.1",
        "2026.1",
        "2025.1",
    ]


def test_version_history_dates_descending(
    old_methodology,
    current_methodology,
    latest_methodology,
):
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200

    data = response.json()

    release_dates = [
        item["release_date"]
        for item in data
    ]

    assert release_dates == sorted(
        release_dates,
        reverse=True,
    )


def test_version_history_current_flag(
    old_methodology,
    current_methodology,
):
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200

    data = response.json()

    current_versions = [
        item
        for item in data
        if item["is_current"] is True
    ]

    assert len(current_versions) == 1

    assert (
        current_versions[0]["version"]
        == "2026.1"
    )


@pytest_asyncio.fixture
async def methodology_without_description(
    db_session,
):
    methodology = MethodologyVersion(
        id=uuid.uuid4(),
        version="2026.2",
        title="Methodology Without Description",
        description=None,
        release_date=date(2026, 7, 1),
        is_current=False,
    )

    db_session.add(methodology)
    await db_session.commit()
    await db_session.refresh(methodology)

    return methodology


def test_nullable_description(
    methodology_without_description,
):
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["description"] is None


def test_version_history_content_type(
    current_methodology,
):
    response = client.get(
        "/api/methodology/version-history"
    )

    assert response.status_code == 200

    assert (
        "application/json"
        in response.headers["content-type"]
    )


def test_invalid_methodology_route():
    response = client.get(
        "/api/methodology/invalid-route"
    )

    assert response.status_code == 404