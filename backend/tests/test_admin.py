import sys
import os
import json
import uuid
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock, patch

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient

from main import app
from auth.middleware import require_admin
from database.connections import get_redis
from database.models import User, University

import routers.admin as admin_router


client = TestClient(app)


# =========================================================
# TEST ADMIN DEPENDENCY
# =========================================================

def override_require_admin():
    admin = MagicMock(spec=User)
    admin.email = "admin.test@aur.com"
    admin.role = "admin"
    return admin


# =========================================================
# FAKE REDIS
# =========================================================

class FakeRedis:
    def __init__(self):
        self.deleted_keys = []

    async def delete(self, *keys):
        self.deleted_keys.extend(keys)
        return len(keys)


fake_redis = FakeRedis()


async def override_get_redis():
    return fake_redis


# =========================================================
# TEST UNIVERSITY FIXTURE
# =========================================================

@pytest_asyncio.fixture
async def sample_university(db_session):
    """
    Create one university in the test database.

    The fixture automatically uses only model columns that actually
    exist, so it stays compatible with the current University model.
    """

    columns = {
        column.name
        for column in University.__table__.columns
    }

    values = {}

    possible_values = {
        "id": uuid.uuid4(),
        "slug": "test-university",
        "name": "Test University",
        "location": "India",
        "country": "India",
        "subregion": "Southern Asia",
        "size": "L",
        "focus": "FC",
        "research_level": "VH",
        "is_public": True,
        "isPublic": True,
        "description": "Original description",
        "placement_percentage": 80.0,
    }

    for field, value in possible_values.items():
        if field in columns:
            values[field] = value

    university = University(**values)

    db_session.add(university)
    await db_session.commit()
    await db_session.refresh(university)

    return university


# =========================================================
# AUTHENTICATION / AUTHORIZATION TESTS
# =========================================================

def test_upload_requires_admin():
    app.dependency_overrides.pop(require_admin, None)

    response = client.post(
        "/admin/upload",
        files={
            "file": (
                "sample.csv",
                b"name,country\nTest University,India",
                "text/csv",
            )
        },
    )

    assert response.status_code in [401, 403]

    app.dependency_overrides[require_admin] = override_require_admin


def test_update_university_requires_admin():
    app.dependency_overrides.pop(require_admin, None)

    response = client.patch(
        "/admin/university/test-university",
        json={
            "description": "Updated"
        },
    )

    assert response.status_code in [401, 403]

    app.dependency_overrides[require_admin] = override_require_admin


def test_publish_requires_admin():
    app.dependency_overrides.pop(require_admin, None)

    response = client.post("/admin/publish")

    assert response.status_code in [401, 403]

    app.dependency_overrides[require_admin] = override_require_admin


def test_audit_log_requires_admin():
    app.dependency_overrides.pop(require_admin, None)

    response = client.get("/admin/audit-log")

    assert response.status_code in [401, 403]

    app.dependency_overrides[require_admin] = override_require_admin


def test_data_quality_requires_admin():
    app.dependency_overrides.pop(require_admin, None)

    response = client.get("/admin/data-quality")

    assert response.status_code in [401, 403]

    app.dependency_overrides[require_admin] = override_require_admin


# =========================================================
# UPLOAD TESTS
# =========================================================

def test_upload_csv_success(tmp_path, monkeypatch):
    monkeypatch.setattr(admin_router, "DATA_DIR", tmp_path)

    fake_redis.deleted_keys.clear()

    with patch("routers.admin.subprocess.run") as mock_run:
        response = client.post(
            "/admin/upload",
            files={
                "file": (
                    "sample.csv",
                    b"name,country\nTest University,India",
                    "text/csv",
                )
            },
        )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["uploaded_by"] == "admin.test@aur.com"
    assert data["filename"].endswith(".csv")
    assert data["universities_loaded"] == 0
    assert data["universities_skipped"] == 0
    assert isinstance(data["errors"], list)

    uploaded_file = tmp_path / data["filename"]

    assert uploaded_file.exists()

    mock_run.assert_called_once()


def test_upload_xlsx_success(tmp_path, monkeypatch):
    monkeypatch.setattr(admin_router, "DATA_DIR", tmp_path)

    with patch("routers.admin.subprocess.run"):
        response = client.post(
            "/admin/upload",
            files={
                "file": (
                    "sample.xlsx",
                    b"fake excel content",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["filename"].endswith(".xlsx")


def test_upload_xls_success(tmp_path, monkeypatch):
    monkeypatch.setattr(admin_router, "DATA_DIR", tmp_path)

    with patch("routers.admin.subprocess.run"):
        response = client.post(
            "/admin/upload",
            files={
                "file": (
                    "sample.xls",
                    b"fake excel content",
                    "application/vnd.ms-excel",
                )
            },
        )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["filename"].endswith(".xls")


def test_upload_invalid_file_type():
    response = client.post(
        "/admin/upload",
        files={
            "file": (
                "sample.txt",
                b"invalid file",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid file type"


def test_upload_invalid_executable():
    response = client.post(
        "/admin/upload",
        files={
            "file": (
                "malware.exe",
                b"invalid",
                "application/octet-stream",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid file type"


def test_upload_missing_file():
    response = client.post("/admin/upload")

    assert response.status_code == 422


def test_upload_invalidates_cache(tmp_path, monkeypatch):
    monkeypatch.setattr(admin_router, "DATA_DIR", tmp_path)

    fake_redis.deleted_keys.clear()

    with patch("routers.admin.subprocess.run"):
        response = client.post(
            "/admin/upload",
            files={
                "file": (
                    "cache.csv",
                    b"name,country\nTest University,India",
                    "text/csv",
                )
            },
        )

    assert response.status_code == 200

    assert "countries:list" in fake_redis.deleted_keys
    assert "analytics:summary" in fake_redis.deleted_keys


def test_upload_handles_seed_failure(tmp_path, monkeypatch):
    monkeypatch.setattr(admin_router, "DATA_DIR", tmp_path)

    with patch(
        "routers.admin.subprocess.run",
        side_effect=Exception("Seed failed"),
    ):
        response = client.post(
            "/admin/upload",
            files={
                "file": (
                    "sample.csv",
                    b"name,country\nTest University,India",
                    "text/csv",
                )
            },
        )

    # Current router intentionally catches seed errors
    assert response.status_code == 200
    assert response.json()["status"] == "success"


# =========================================================
# UPDATE UNIVERSITY TESTS
# =========================================================

def test_update_university_success(
    sample_university,
    tmp_path,
    monkeypatch,
):
    audit_file = tmp_path / "audit_log.json"

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        audit_file,
    )

    response = client.patch(
        f"/admin/university/{sample_university.id}",
        json={
            "description": "Updated description"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["description"] == "Updated description"


def test_update_university_not_found(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        tmp_path / "audit_log.json",
    )
    nonexistent_id = uuid.uuid4()
    response = client.patch(
        f"/admin/university/{nonexistent_id}",
        json={
            "name": "Updated Name"
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "University not found"


def test_update_unknown_field_is_ignored(
    sample_university,
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        tmp_path / "audit_log.json",
    )

    response = client.patch(
        f"/admin/university/{sample_university.id}",
        json={
            "field_that_does_not_exist": "test"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "field_that_does_not_exist" not in data


def test_update_creates_audit_log(
    sample_university,
    tmp_path,
    monkeypatch,
):
    audit_file = tmp_path / "audit_log.json"

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        audit_file,
    )

    response = client.patch(
        f"/admin/university/{sample_university.id}",
        json={
            "description": "Audit test"
        },
    )

    assert response.status_code == 200

    assert audit_file.exists()

    logs = json.loads(
        audit_file.read_text()
    )

    assert isinstance(logs, list)
    assert len(logs) >= 1

    latest = logs[-1]

    assert latest["user"] == "admin.test@aur.com"
    assert latest["action"] == "UPDATE"
    assert latest["field"] == "description"
    assert latest["new_value"] == "Audit test"
    assert "timestamp" in latest


def test_update_appends_existing_audit_log(
    sample_university,
    tmp_path,
    monkeypatch,
):
    audit_file = tmp_path / "audit_log.json"

    existing_log = [
        {
            "user": "old@aur.com",
            "action": "UPDATE",
            "university": "Old University",
            "field": "description",
            "old_value": "old",
            "new_value": "new",
            "timestamp": "2026-01-01T00:00:00",
        }
    ]

    audit_file.write_text(
        json.dumps(existing_log)
    )

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        audit_file,
    )

    response = client.patch(
        f"/admin/university/{sample_university.id}",
        json={
            "description": "New audit value"
        },
    )

    assert response.status_code == 200

    logs = json.loads(
        audit_file.read_text()
    )

    assert len(logs) == 2


def test_invalid_placement_percentage_above_100(
    sample_university,
    tmp_path,
    monkeypatch,
):
    if not hasattr(
        sample_university,
        "placement_percentage",
    ):
        pytest.skip(
            "University model has no placement_percentage field"
        )

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        tmp_path / "audit_log.json",
    )

    response = client.patch(
        f"/admin/university/{sample_university.id}",
        json={
            "placement_percentage": 101
        },
    )

    assert response.status_code == 422


def test_invalid_placement_percentage_below_zero(
    sample_university,
    tmp_path,
    monkeypatch,
):
    if not hasattr(
        sample_university,
        "placement_percentage",
    ):
        pytest.skip(
            "University model has no placement_percentage field"
        )

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        tmp_path / "audit_log.json",
    )

    response = client.patch(
        f"/admin/university/{sample_university.id}",
        json={
            "placement_percentage": -1
        },
    )

    assert response.status_code == 422


# =========================================================
# PUBLISH TESTS
# =========================================================

def test_publish_no_dataset(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        admin_router,
        "DATA_DIR",
        tmp_path,
    )

    monkeypatch.setattr(
        admin_router,
        "PUBLISH_FILE",
        tmp_path / "publish.json",
    )

    response = client.post("/admin/publish")

    assert response.status_code == 404
    assert response.json()["detail"] == "No dataset uploaded"


def test_publish_dataset_success(
    tmp_path,
    monkeypatch,
):
    dataset = tmp_path / "dataset_20260711_120000.csv"

    dataset.write_text(
        "name,country\nTest University,India"
    )

    publish_file = tmp_path / "publish.json"

    monkeypatch.setattr(
        admin_router,
        "DATA_DIR",
        tmp_path,
    )

    monkeypatch.setattr(
        admin_router,
        "PUBLISH_FILE",
        publish_file,
    )

    fake_redis.deleted_keys.clear()

    response = client.post("/admin/publish")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "published"
    assert data["dataset"] == dataset.name
    assert "published_at" in data

    assert publish_file.exists()


def test_publish_writes_correct_json(
    tmp_path,
    monkeypatch,
):
    dataset = tmp_path / "dataset_20260711_130000.xlsx"

    dataset.write_bytes(
        b"fake dataset"
    )

    publish_file = tmp_path / "publish.json"

    monkeypatch.setattr(
        admin_router,
        "DATA_DIR",
        tmp_path,
    )

    monkeypatch.setattr(
        admin_router,
        "PUBLISH_FILE",
        publish_file,
    )

    response = client.post("/admin/publish")

    assert response.status_code == 200

    saved = json.loads(
        publish_file.read_text()
    )

    assert saved["status"] == "published"
    assert saved["dataset"] == dataset.name
    assert "published_at" in saved


def test_publish_uses_latest_dataset(
    tmp_path,
    monkeypatch,
):
    old_dataset = (
        tmp_path /
        "dataset_20260710_100000.csv"
    )

    new_dataset = (
        tmp_path /
        "dataset_20260711_100000.csv"
    )

    old_dataset.write_text("old")
    new_dataset.write_text("new")

    monkeypatch.setattr(
        admin_router,
        "DATA_DIR",
        tmp_path,
    )

    monkeypatch.setattr(
        admin_router,
        "PUBLISH_FILE",
        tmp_path / "publish.json",
    )

    response = client.post("/admin/publish")

    assert response.status_code == 200

    assert (
        response.json()["dataset"]
        == new_dataset.name
    )


def test_publish_invalidates_cache(
    tmp_path,
    monkeypatch,
):
    dataset = tmp_path / "dataset_20260711_140000.csv"

    dataset.write_text("test")

    monkeypatch.setattr(
        admin_router,
        "DATA_DIR",
        tmp_path,
    )

    monkeypatch.setattr(
        admin_router,
        "PUBLISH_FILE",
        tmp_path / "publish.json",
    )

    fake_redis.deleted_keys.clear()

    response = client.post("/admin/publish")

    assert response.status_code == 200

    assert "countries:list" in fake_redis.deleted_keys
    assert "analytics:summary" in fake_redis.deleted_keys


# =========================================================
# AUDIT LOG TESTS
# =========================================================

def test_audit_log_empty(
    tmp_path,
    monkeypatch,
):
    audit_file = tmp_path / "audit_log.json"

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        audit_file,
    )

    response = client.get("/admin/audit-log")

    assert response.status_code == 200
    assert response.json() == []


def test_audit_log_returns_logs(
    tmp_path,
    monkeypatch,
):
    audit_file = tmp_path / "audit_log.json"

    logs = [
        {
            "user": "admin.test@aur.com",
            "action": "UPDATE",
            "university": "Test University",
            "field": "description",
            "old_value": "Old",
            "new_value": "New",
            "timestamp": "2026-07-11T12:00:00",
        }
    ]

    audit_file.write_text(
        json.dumps(logs)
    )

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        audit_file,
    )

    response = client.get("/admin/audit-log")

    assert response.status_code == 200
    assert response.json() == logs


def test_audit_log_filter_by_user(
    tmp_path,
    monkeypatch,
):
    audit_file = tmp_path / "audit_log.json"

    logs = [
        {
            "user": "admin.test@aur.com",
            "action": "UPDATE",
        },
        {
            "user": "other@aur.com",
            "action": "UPDATE",
        },
    ]

    audit_file.write_text(
        json.dumps(logs)
    )

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        audit_file,
    )

    response = client.get(
        "/admin/audit-log",
        params={
            "user": "admin.test@aur.com"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["user"] == "admin.test@aur.com"


def test_audit_log_filter_unknown_user(
    tmp_path,
    monkeypatch,
):
    audit_file = tmp_path / "audit_log.json"

    logs = [
        {
            "user": "admin.test@aur.com",
            "action": "UPDATE",
        }
    ]

    audit_file.write_text(
        json.dumps(logs)
    )

    monkeypatch.setattr(
        admin_router,
        "AUDIT_FILE",
        audit_file,
    )

    response = client.get(
        "/admin/audit-log",
        params={
            "user": "unknown@aur.com"
        },
    )

    assert response.status_code == 200
    assert response.json() == []


# =========================================================
# DATA QUALITY TESTS
# =========================================================

def test_data_quality_endpoint():
    response = client.get("/admin/data-quality")

    assert response.status_code == 200


def test_data_quality_structure():
    response = client.get("/admin/data-quality")

    assert response.status_code == 200

    data = response.json()

    required_fields = [
        "overall_score_nulls",
        "research_score_nulls",
        "placement_score_nulls",
        "faculty_score_nulls",
    ]

    for field in required_fields:
        assert field in data


def test_data_quality_values_are_integers():
    data = client.get(
        "/admin/data-quality"
    ).json()

    for value in data.values():
        assert isinstance(value, int)


def test_data_quality_values_non_negative():
    data = client.get(
        "/admin/data-quality"
    ).json()

    for value in data.values():
        assert value >= 0


# =========================================================
# MODULE SETUP / CLEANUP
# =========================================================

def setup_module(module):
    app.dependency_overrides[
        require_admin
    ] = override_require_admin

    app.dependency_overrides[
        get_redis
    ] = override_get_redis


def teardown_module(module):
    app.dependency_overrides.pop(
        require_admin,
        None,
    )

    app.dependency_overrides.pop(
        get_redis,
        None,
    )