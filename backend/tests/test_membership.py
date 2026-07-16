import sys
import os
import uuid
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import select

from main import app
from auth.middleware import get_current_user
from database.models import User, MembershipTier, UserMembership


client = TestClient(app)


# =========================================================
# TEST USER
# =========================================================

TEST_USER_ID = uuid.uuid4()


def override_get_current_user():
    user = User(
        id=TEST_USER_ID,
        first_name="Test",
        last_name="User",
        email="membership.test@aur.com",
        password_hash="test-hash",
        role="user",
    )
    return user


# =========================================================
# FIXTURES
# =========================================================

@pytest_asyncio.fixture
async def test_user(db_session):
    user = User(
        id=TEST_USER_ID,
        first_name="Test",
        last_name="User",
        email="membership.test@aur.com",
        password_hash="test-hash",
        role="user",
    )

    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user


@pytest_asyncio.fixture
async def basic_tier(db_session):
    tier = MembershipTier(
        name="Basic",
        price=999,
        duration_months=1,
        benefits=[
            "Basic profile access",
            "University comparison",
        ],
    )

    db_session.add(tier)
    await db_session.commit()
    await db_session.refresh(tier)

    return tier


@pytest_asyncio.fixture
async def premium_tier(db_session):
    tier = MembershipTier(
        name="Premium",
        price=2999,
        duration_months=12,
        benefits=[
            "Profile verification",
            "Advanced analytics",
            "Institutional data submissions",
            "Participation in events and awards",
        ],
    )

    db_session.add(tier)
    await db_session.commit()
    await db_session.refresh(tier)

    return tier


@pytest_asyncio.fixture
async def active_membership(
    db_session,
    test_user,
    premium_tier,
):
    start = datetime.utcnow()

    membership = UserMembership(
        user_id=test_user.id,
        tier_id=premium_tier.id,
        start_date=start,
        end_date=datetime(
            start.year + 1,
            start.month,
            start.day,
            start.hour,
            start.minute,
            start.second,
        ),
        status="active",
    )

    db_session.add(membership)
    await db_session.commit()
    await db_session.refresh(membership)

    return membership


# =========================================================
# GET /api/membership/tiers
# =========================================================

def test_list_tiers_empty():
    response = client.get(
        "/api/membership/tiers"
    )

    assert response.status_code == 200
    assert response.json() == []


def test_list_tiers_success(
    basic_tier,
    premium_tier,
):
    response = client.get(
        "/api/membership/tiers"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 2


def test_list_tiers_structure(
    premium_tier,
):
    response = client.get(
        "/api/membership/tiers"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1

    tier = data[0]

    required_fields = [
        "id",
        "name",
        "price",
        "duration_months",
        "benefits",
    ]

    for field in required_fields:
        assert field in tier


def test_list_tiers_values(
    premium_tier,
):
    response = client.get(
        "/api/membership/tiers"
    )

    assert response.status_code == 200

    data = response.json()

    tier = data[0]

    assert tier["id"] == str(premium_tier.id)
    assert tier["name"] == "Premium"
    assert float(tier["price"]) == 2999
    assert tier["duration_months"] == 12

    assert isinstance(
        tier["benefits"],
        list,
    )

    assert len(tier["benefits"]) == 4


# =========================================================
# AUTHENTICATION TESTS
# =========================================================

def test_subscribe_requires_authentication(
    premium_tier,
):
    app.dependency_overrides.pop(
        get_current_user,
        None,
    )

    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": str(premium_tier.id)
        },
    )

    assert response.status_code in [
        401,
        403,
    ]

    app.dependency_overrides[
        get_current_user
    ] = override_get_current_user


def test_status_requires_authentication():
    app.dependency_overrides.pop(
        get_current_user,
        None,
    )

    response = client.get(
        "/api/membership/status"
    )

    assert response.status_code in [
        401,
        403,
    ]

    app.dependency_overrides[
        get_current_user
    ] = override_get_current_user


# =========================================================
# POST /api/membership/subscribe
# =========================================================

def test_subscribe_success(
    test_user,
    premium_tier,
):
    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": str(premium_tier.id)
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert "id" in data
    assert "tier" in data
    assert "start_date" in data
    assert "end_date" in data
    assert "status" in data

    assert data["status"] == "active"


def test_subscribe_returns_correct_tier(
    test_user,
    premium_tier,
):
    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": str(premium_tier.id)
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert (
        data["tier"]["id"]
        == str(premium_tier.id)
    )

    assert (
        data["tier"]["name"]
        == "Premium"
    )

    assert (
        float(data["tier"]["price"])
        == 2999
    )

    assert (
        data["tier"]["duration_months"]
        == 12
    )


def test_subscribe_returns_benefits(
    test_user,
    premium_tier,
):
    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": str(premium_tier.id)
        },
    )

    assert response.status_code == 201

    benefits = (
        response
        .json()["tier"]["benefits"]
    )

    assert isinstance(
        benefits,
        list,
    )

    assert (
        "Advanced analytics"
        in benefits
    )


def test_subscribe_invalid_tier_uuid(
    test_user,
):
    invalid_id = uuid.uuid4()

    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": str(invalid_id)
        },
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Membership tier not found"
    )


def test_subscribe_malformed_uuid(
    test_user,
):
    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": "not-a-valid-uuid"
        },
    )

    assert response.status_code == 422


def test_subscribe_missing_tier_id(
    test_user,
):
    response = client.post(
        "/api/membership/subscribe",
        json={},
    )

    assert response.status_code == 422


def test_subscribe_empty_body(
    test_user,
):
    response = client.post(
        "/api/membership/subscribe"
    )

    assert response.status_code == 422


def test_subscribe_basic_tier_duration(
    test_user,
    basic_tier,
):
    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": str(basic_tier.id)
        },
    )

    assert response.status_code == 201

    data = response.json()

    start = datetime.fromisoformat(
        data["start_date"]
        .replace("Z", "+00:00")
    )

    end = datetime.fromisoformat(
        data["end_date"]
        .replace("Z", "+00:00")
    )

    duration = (
        end - start
    ).days

    assert duration == 30


def test_subscribe_premium_duration(
    test_user,
    premium_tier,
):
    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": str(premium_tier.id)
        },
    )

    assert response.status_code == 201

    data = response.json()

    start = datetime.fromisoformat(
        data["start_date"]
        .replace("Z", "+00:00")
    )

    end = datetime.fromisoformat(
        data["end_date"]
        .replace("Z", "+00:00")
    )

    duration = (
        end - start
    ).days

    assert duration == 360


# =========================================================
# DATABASE PERSISTENCE
# =========================================================

@pytest.mark.asyncio
async def test_subscription_saved_to_database(
    db_session,
    test_user,
    premium_tier,
):
    response = client.post(
        "/api/membership/subscribe",
        json={
            "tier_id": str(premium_tier.id)
        },
    )

    assert response.status_code == 201

    membership_id = uuid.UUID(
        response.json()["id"]
    )

    result = await db_session.execute(
        select(UserMembership).where(
            UserMembership.id
            == membership_id
        )
    )

    membership = (
        result.scalar_one_or_none()
    )

    assert membership is not None

    assert (
        membership.user_id
        == test_user.id
    )

    assert (
        membership.tier_id
        == premium_tier.id
    )

    assert (
        membership.status
        == "active"
    )


# =========================================================
# GET /api/membership/status
# =========================================================

def test_status_no_active_membership(
    test_user,
):
    response = client.get(
        "/api/membership/status"
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "No active membership found"
    )


def test_status_success(
    active_membership,
):
    response = client.get(
        "/api/membership/status"
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["id"]
        == str(active_membership.id)
    )

    assert data["status"] == "active"


def test_status_returns_tier(
    active_membership,
    premium_tier,
):
    response = client.get(
        "/api/membership/status"
    )

    assert response.status_code == 200

    data = response.json()

    assert "tier" in data

    assert (
        data["tier"]["id"]
        == str(premium_tier.id)
    )

    assert (
        data["tier"]["name"]
        == "Premium"
    )


def test_status_response_structure(
    active_membership,
):
    response = client.get(
        "/api/membership/status"
    )

    assert response.status_code == 200

    data = response.json()

    required_fields = [
        "id",
        "tier",
        "start_date",
        "end_date",
        "status",
    ]

    for field in required_fields:
        assert field in data


@pytest_asyncio.fixture
async def expired_membership(
    db_session,
    test_user,
    premium_tier,
):
    membership = UserMembership(
        user_id=test_user.id,
        tier_id=premium_tier.id,
        start_date=datetime(
            2025,
            1,
            1,
        ),
        end_date=datetime(
            2025,
            12,
            31,
        ),
        status="expired",
    )

    db_session.add(membership)
    await db_session.commit()
    await db_session.refresh(membership)

    return membership


def test_status_ignores_expired_membership(
    expired_membership,
):
    response = client.get(
        "/api/membership/status"
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "No active membership found"
    )


# =========================================================
# MULTIPLE MEMBERSHIPS
# =========================================================

@pytest_asyncio.fixture
async def two_active_memberships(
    db_session,
    test_user,
    basic_tier,
    premium_tier,
):
    old_membership = UserMembership(
        user_id=test_user.id,
        tier_id=basic_tier.id,
        start_date=datetime(
            2026,
            1,
            1,
        ),
        end_date=datetime(
            2027,
            1,
            1,
        ),
        status="active",
    )

    new_membership = UserMembership(
        user_id=test_user.id,
        tier_id=premium_tier.id,
        start_date=datetime(
            2026,
            7,
            1,
        ),
        end_date=datetime(
            2027,
            7,
            1,
        ),
        status="active",
    )

    db_session.add_all([
        old_membership,
        new_membership,
    ])

    await db_session.commit()

    return (
        old_membership,
        new_membership,
    )


def test_status_returns_latest_active_membership(
    two_active_memberships,
):
    old_membership, new_membership = (
        two_active_memberships
    )

    response = client.get(
        "/api/membership/status"
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["id"]
        == str(new_membership.id)
    )

    assert (
        data["tier"]["name"]
        == "Premium"
    )


# =========================================================
# SETUP / CLEANUP
# =========================================================

def setup_module(module):
    app.dependency_overrides[
        get_current_user
    ] = override_get_current_user


def teardown_module(module):
    app.dependency_overrides.pop(
        get_current_user,
        None,
    )