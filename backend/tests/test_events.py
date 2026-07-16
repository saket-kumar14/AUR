import sys
import os
import uuid
from datetime import date, datetime

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import pytest_asyncio
from fastapi.testclient import TestClient

from main import app
from auth.middleware import require_admin
from database.models import (
    User,
    University,
    Event,
    Application,
    JudgeScore,
)

import routers.events as events_router


client = TestClient(app)


# =========================================================
# TEST ADMIN
# =========================================================

TEST_ADMIN_ID = uuid.uuid4()


def override_require_admin():
    admin = User(
        id=TEST_ADMIN_ID,
        first_name="Test",
        last_name="Admin",
        email="events.admin@aur.com",
        password_hash="test-hash",
        role="admin",
    )
    return admin


# =========================================================
# FIXTURES
# =========================================================

@pytest_asyncio.fixture
async def sample_event(db_session):
    event = Event(
        title="AUR Excellence Awards 2026",
        description="Annual university excellence awards",
        type="award",
        eligibility_criteria="Open to eligible universities",
        deadline=date(2026, 12, 31),
        status="open",
    )

    db_session.add(event)
    await db_session.commit()
    await db_session.refresh(event)

    return event


@pytest_asyncio.fixture
async def second_event(db_session):
    event = Event(
        title="AUR Research Summit 2026",
        description="Research and innovation event",
        type="event",
        eligibility_criteria="Open to universities",
        deadline=date(2026, 10, 1),
        status="open",
    )

    db_session.add(event)
    await db_session.commit()
    await db_session.refresh(event)

    return event

@pytest_asyncio.fixture
async def sample_university(db_session):
    columns = {
        column.name
        for column in University.__table__.columns
    }

    values = {}

    possible_values = {
        "id": uuid.uuid4(),
        "slug": "events-test-university",
        "name": "Events Test University",
        "location": "India",
        "country": "India",
        "subregion": "Southern Asia",
        "size": "L",
        "focus": "FC",
        "research": "VH",
        "is_public": True,
        "isPublic": True,
    }

    for field, value in possible_values.items():
        if field in columns:
            values[field] = value

    university = University(**values)

    db_session.add(university)
    await db_session.commit()
    await db_session.refresh(university)

    return university


@pytest_asyncio.fixture
async def sample_application(
    db_session,
    sample_event,
    sample_university,
):
    application = Application(
        event_id=sample_event.id,
        university_id=sample_university.id,
        documents=[],
        status="submitted",
    )

    db_session.add(application)
    await db_session.commit()
    await db_session.refresh(application)

    return application


# =========================================================
# GET /api/events-awards/
# =========================================================

def test_list_events_empty():
    response = client.get(
        "/api/events-awards/"
    )

    assert response.status_code == 200
    assert response.json() == []


def test_list_events_success(
    sample_event,
):
    response = client.get(
        "/api/events-awards/"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 1


def test_list_events_structure(
    sample_event,
):
    response = client.get(
        "/api/events-awards/"
    )

    assert response.status_code == 200

    event = response.json()[0]

    required_fields = [
        "id",
        "title",
        "description",
        "type",
        "eligibility_criteria",
        "deadline",
        "status",
        "created_at",
    ]

    for field in required_fields:
        assert field in event


def test_list_events_values(
    sample_event,
):
    response = client.get(
        "/api/events-awards/"
    )

    assert response.status_code == 200

    event = response.json()[0]

    assert (
        event["id"]
        == str(sample_event.id)
    )

    assert (
        event["title"]
        == "AUR Excellence Awards 2026"
    )

    assert event["type"] == "award"
    assert event["status"] == "open"


def test_list_events_ordered_by_deadline(
    sample_event,
    second_event,
):
    response = client.get(
        "/api/events-awards/"
    )

    assert response.status_code == 200

    data = response.json()

    deadlines = [
        item["deadline"]
        for item in data
    ]

    assert deadlines == sorted(deadlines)


# =========================================================
# GET /api/events-awards/{event_id}
# =========================================================

def test_get_event_success(
    sample_event,
):
    response = client.get(
        f"/api/events-awards/{sample_event.id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["id"]
        == str(sample_event.id)
    )

    assert (
        data["title"]
        == sample_event.title
    )


def test_get_event_not_found():
    missing_id = uuid.uuid4()

    response = client.get(
        f"/api/events-awards/{missing_id}"
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Event not found"
    )


# =========================================================
# POST /api/events-awards/
# =========================================================

def test_create_event_requires_admin():
    app.dependency_overrides.pop(
        require_admin,
        None,
    )

    response = client.post(
        "/api/events-awards/",
        json={
            "title": "Protected Event",
            "description": "Test",
            "type": "event",
            "eligibility_criteria": "Test",
            "deadline": "2026-12-31",
        },
    )

    assert response.status_code in [
        401,
        403,
    ]

    app.dependency_overrides[
        require_admin
    ] = override_require_admin


def test_create_event_success():
    response = client.post(
        "/api/events-awards/",
        json={
            "title": "New AUR Event",
            "description": "New test event",
            "type": "event",
            "eligibility_criteria": "All universities",
            "deadline": "2026-11-30",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert "id" in data
    assert data["title"] == "New AUR Event"
    assert data["type"] == "event"
    assert data["deadline"] == "2026-11-30"


def test_create_award_success():
    response = client.post(
        "/api/events-awards/",
        json={
            "title": "Research Excellence Award",
            "description": "Research award",
            "type": "award",
            "eligibility_criteria": "Research universities",
            "deadline": "2026-12-15",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["type"] == "award"


def test_create_event_minimal_payload():
    response = client.post(
        "/api/events-awards/",
        json={
            "title": "Minimal Event",
            "type": "event",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Minimal Event"
    assert data["description"] is None
    assert data["deadline"] is None


def test_create_event_missing_title():
    response = client.post(
        "/api/events-awards/",
        json={
            "type": "event"
        },
    )

    assert response.status_code == 422


def test_create_event_missing_type():
    response = client.post(
        "/api/events-awards/",
        json={
            "title": "Missing Type"
        },
    )

    assert response.status_code == 422


def test_create_event_invalid_deadline():
    response = client.post(
        "/api/events-awards/",
        json={
            "title": "Invalid Date Event",
            "type": "event",
            "deadline": "not-a-date",
        },
    )

    assert response.status_code == 422


# =========================================================
# POST /api/events-awards/applications
# =========================================================

def test_submit_application_without_file(
    sample_event,
    sample_university,
):
    response = client.post(
        "/api/events-awards/applications",
        data={
            "event_id": str(sample_event.id),
            "university_id": str(
                sample_university.id
            ),
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert "id" in data

    assert (
        data["event_id"]
        == str(sample_event.id)
    )

    assert (
        data["university_id"]
        == str(sample_university.id)
    )

    assert data["documents"] == []
    assert data["status"] == "submitted"


def test_submit_application_with_file(
    sample_event,
    sample_university,
    tmp_path,
    monkeypatch,
):
    upload_dir = (
        tmp_path /
        "applications"
    )

    upload_dir.mkdir()

    monkeypatch.setattr(
        events_router,
        "UPLOAD_DIR",
        upload_dir,
    )

    monkeypatch.setattr(
        events_router,
        "BASE_DIR",
        tmp_path,
    )

    response = client.post(
        "/api/events-awards/applications",
        data={
            "event_id": str(sample_event.id),
            "university_id": str(
                sample_university.id
            ),
        },
        files={
            "files": (
                "application.txt",
                b"test application document",
                "text/plain",
            )
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert len(data["documents"]) == 1

    saved_files = list(
        upload_dir.iterdir()
    )

    assert len(saved_files) == 1

    assert (
        saved_files[0].read_bytes()
        == b"test application document"
    )


def test_submit_application_invalid_event(
    sample_university,
):
    response = client.post(
        "/api/events-awards/applications",
        data={
            "event_id": str(uuid.uuid4()),
            "university_id": str(
                sample_university.id
            ),
        },
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Event not found"
    )


def test_submit_application_invalid_university(
    sample_event,
):
    response = client.post(
        "/api/events-awards/applications",
        data={
            "event_id": str(sample_event.id),
            "university_id": str(
                uuid.uuid4()
            ),
        },
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "University not found"
    )


def test_submit_application_missing_event_id(
    sample_university,
):
    response = client.post(
        "/api/events-awards/applications",
        data={
            "university_id": str(
                sample_university.id
            ),
        },
    )

    assert response.status_code == 422


def test_submit_application_missing_university_id(
    sample_event,
):
    response = client.post(
        "/api/events-awards/applications",
        data={
            "event_id": str(sample_event.id)
        },
    )

    assert response.status_code == 422


# =========================================================
# GET APPLICATION STATUS
# =========================================================

def test_get_application_status_success(
    sample_application,
):
    response = client.get(
        "/api/events-awards/"
        f"applications/{sample_application.id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["id"]
        == str(sample_application.id)
    )

    assert data["status"] == "submitted"


def test_get_application_status_structure(
    sample_application,
):
    response = client.get(
        "/api/events-awards/"
        f"applications/{sample_application.id}"
    )

    assert response.status_code == 200

    data = response.json()

    required_fields = [
        "id",
        "event_id",
        "university_id",
        "documents",
        "status",
        "submitted_at",
    ]

    for field in required_fields:
        assert field in data


def test_get_application_status_not_found():
    response = client.get(
        "/api/events-awards/"
        f"applications/{uuid.uuid4()}"
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Application not found"
    )


# =========================================================
# POST JUDGE SCORE
# =========================================================

SCORE_PAYLOAD = {
    "judge_id": "judge-001",
    "academic_score": 90,
    "research_score": 80,
    "outcomes_score": 70,
    "impact_score": 60,
    "collaboration_score": 50,
    "governance_score": 40,
}


def test_submit_score_requires_admin(
    sample_application,
):
    app.dependency_overrides.pop(
        require_admin,
        None,
    )

    response = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=SCORE_PAYLOAD,
    )

    assert response.status_code in [
        401,
        403,
    ]

    app.dependency_overrides[
        require_admin
    ] = override_require_admin


def test_submit_score_success(
    sample_application,
):
    response = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=SCORE_PAYLOAD,
    )

    assert response.status_code == 201

    data = response.json()

    assert "id" in data

    assert (
        data["application_id"]
        == str(sample_application.id)
    )

    assert data["judge_id"] == "judge-001"

    assert (
        float(data["academic_score"])
        == 90
    )


def test_submit_score_updates_application_status(
    sample_application,
):
    response = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=SCORE_PAYLOAD,
    )

    assert response.status_code == 201

    status_response = client.get(
        "/api/events-awards/"
        f"applications/{sample_application.id}"
    )

    assert status_response.status_code == 200

    assert (
        status_response.json()["status"]
        == "under_review"
    )


def test_submit_score_application_not_found():
    response = client.post(
        "/api/events-awards/"
        f"applications/{uuid.uuid4()}/score",
        json=SCORE_PAYLOAD,
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Application not found"
    )


def test_submit_score_missing_field(
    sample_application,
):
    payload = SCORE_PAYLOAD.copy()

    payload.pop(
        "academic_score"
    )

    response = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=payload,
    )

    assert response.status_code == 422


def test_duplicate_judge_score_rejected(
    sample_application,
):
    first = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=SCORE_PAYLOAD,
    )

    assert first.status_code == 201

    second = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=SCORE_PAYLOAD,
    )

    assert second.status_code == 400

    assert (
        second.json()["detail"]
        == "This judge already scored this application"
    )


# =========================================================
# GET FINAL SCORE
# =========================================================

def test_final_score_no_scores(
    sample_application,
):
    response = client.get(
        "/api/events-awards/"
        f"applications/{sample_application.id}/final-score"
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "No scores submitted yet"
    )


def test_final_score_single_judge(
    sample_application,
):
    score_response = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=SCORE_PAYLOAD,
    )

    assert score_response.status_code == 201

    response = client.get(
        "/api/events-awards/"
        f"applications/{sample_application.id}/final-score"
    )

    assert response.status_code == 200

    data = response.json()

    expected = (
        90 * 0.25
        + 80 * 0.20
        + 70 * 0.20
        + 60 * 0.15
        + 50 * 0.10
        + 40 * 0.10
    )

    assert data["final_score"] == expected
    assert data["judges_count"] == 1

    assert (
        data["application_id"]
        == str(sample_application.id)
    )


def test_final_score_weight_calculation(
    sample_application,
):
    response = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json={
            "judge_id": "judge-weight-test",
            "academic_score": 100,
            "research_score": 100,
            "outcomes_score": 100,
            "impact_score": 100,
            "collaboration_score": 100,
            "governance_score": 100,
        },
    )

    assert response.status_code == 201

    final_response = client.get(
        "/api/events-awards/"
        f"applications/{sample_application.id}/final-score"
    )

    assert final_response.status_code == 200

    data = final_response.json()

    assert data["final_score"] == 100
    assert data["judges_count"] == 1


def test_final_score_multiple_judges(
    sample_application,
):
    first_score = {
        "judge_id": "judge-001",
        "academic_score": 100,
        "research_score": 100,
        "outcomes_score": 100,
        "impact_score": 100,
        "collaboration_score": 100,
        "governance_score": 100,
    }

    second_score = {
        "judge_id": "judge-002",
        "academic_score": 80,
        "research_score": 80,
        "outcomes_score": 80,
        "impact_score": 80,
        "collaboration_score": 80,
        "governance_score": 80,
    }

    first = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=first_score,
    )

    second = client.post(
        "/api/events-awards/"
        f"applications/{sample_application.id}/score",
        json=second_score,
    )

    assert first.status_code == 201
    assert second.status_code == 201

    response = client.get(
        "/api/events-awards/"
        f"applications/{sample_application.id}/final-score"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["final_score"] == 90
    assert data["judges_count"] == 2


# =========================================================
# PATCH PUBLISH RESULT
# =========================================================

def test_publish_requires_admin(
    sample_application,
):
    app.dependency_overrides.pop(
        require_admin,
        None,
    )

    response = client.patch(
        "/api/events-awards/"
        f"applications/{sample_application.id}/publish",
        params={
            "is_winner": True
        },
    )

    assert response.status_code in [
        401,
        403,
    ]

    app.dependency_overrides[
        require_admin
    ] = override_require_admin


def test_publish_winner(
    sample_application,
):
    response = client.patch(
        "/api/events-awards/"
        f"applications/{sample_application.id}/publish",
        params={
            "is_winner": True
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "winner"


def test_publish_rejected(
    sample_application,
):
    response = client.patch(
        "/api/events-awards/"
        f"applications/{sample_application.id}/publish",
        params={
            "is_winner": False
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "rejected"


def test_publish_application_not_found():
    response = client.patch(
        "/api/events-awards/"
        f"applications/{uuid.uuid4()}/publish",
        params={
            "is_winner": True
        },
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Application not found"
    )


def test_publish_missing_is_winner(
    sample_application,
):
    response = client.patch(
        "/api/events-awards/"
        f"applications/{sample_application.id}/publish"
    )

    assert response.status_code == 422


# =========================================================
# SETUP / CLEANUP
# =========================================================

def setup_module(module):
    app.dependency_overrides[
        require_admin
    ] = override_require_admin


def teardown_module(module):
    app.dependency_overrides.pop(
        require_admin,
        None,
    )