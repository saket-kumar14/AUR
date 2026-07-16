import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import select

from main import app
from database.models import NewsletterSubscriber


client = TestClient(app)


# =========================================================
# FIXTURES
# =========================================================

@pytest_asyncio.fixture
async def active_subscriber(db_session):
    subscriber = NewsletterSubscriber(
        email="active@example.com",
        active=True,
    )

    db_session.add(subscriber)
    await db_session.commit()
    await db_session.refresh(subscriber)

    return subscriber


@pytest_asyncio.fixture
async def inactive_subscriber(db_session):
    subscriber = NewsletterSubscriber(
        email="inactive@example.com",
        active=False,
    )

    db_session.add(subscriber)
    await db_session.commit()
    await db_session.refresh(subscriber)

    return subscriber


# =========================================================
# POST /api/newsletter/subscribe
# =========================================================

def test_subscribe_success():
    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": "newsubscriber@example.com"
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert "id" in data
    assert "email" in data
    assert "subscribed_at" in data
    assert "active" in data

    assert (
        data["email"]
        == "newsubscriber@example.com"
    )

    assert data["active"] is True


def test_subscribe_response_structure():
    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": "structure@example.com"
        },
    )

    assert response.status_code == 201

    data = response.json()

    required_fields = [
        "id",
        "email",
        "subscribed_at",
        "active",
    ]

    for field in required_fields:
        assert field in data


def test_subscribe_response_types():
    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": "types@example.com"
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert isinstance(
        data["id"],
        str,
    )

    assert isinstance(
        data["email"],
        str,
    )

    assert isinstance(
        data["subscribed_at"],
        str,
    )

    assert isinstance(
        data["active"],
        bool,
    )


def test_subscribe_duplicate_active_email(
    active_subscriber,
):
    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": active_subscriber.email
        },
    )

    assert response.status_code == 400

    assert (
        response.json()["detail"]
        == "This email is already subscribed."
    )


def test_subscribe_reactivates_inactive_email(
    inactive_subscriber,
):
    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": inactive_subscriber.email
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert (
        data["id"]
        == str(inactive_subscriber.id)
    )

    assert (
        data["email"]
        == inactive_subscriber.email
    )

    assert data["active"] is True


def test_subscribe_missing_email():
    response = client.post(
        "/api/newsletter/subscribe",
        json={},
    )

    assert response.status_code == 422


def test_subscribe_empty_body():
    response = client.post(
        "/api/newsletter/subscribe"
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    "invalid_email",
    [
        "not-an-email",
        "missing-at-sign.com",
        "@example.com",
        "user@",
        "",
        "user example@example.com",
    ],
)
def test_subscribe_invalid_email(
    invalid_email,
):
    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": invalid_email
        },
    )

    assert response.status_code == 422


def test_subscribe_extra_field_ignored():
    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": "extra@example.com",
            "unexpected_field": "ignored",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert (
        data["email"]
        == "extra@example.com"
    )


# =========================================================
# DATABASE PERSISTENCE
# =========================================================

@pytest.mark.asyncio
async def test_subscriber_saved_to_database(
    db_session,
):
    email = "database@example.com"

    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": email
        },
    )

    assert response.status_code == 201

    result = await db_session.execute(
        select(
            NewsletterSubscriber
        ).where(
            NewsletterSubscriber.email
            == email
        )
    )

    subscriber = (
        result.scalar_one_or_none()
    )

    assert subscriber is not None

    assert (
        subscriber.email
        == email
    )

    assert subscriber.active is True


@pytest.mark.asyncio
async def test_reactivated_subscriber_saved(
    db_session,
    inactive_subscriber,
):
    # Store values before expiring the session
    subscriber_id = inactive_subscriber.id
    subscriber_email = inactive_subscriber.email

    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": subscriber_email
        },
    )

    assert response.status_code == 201

    db_session.expire_all()

    result = await db_session.execute(
        select(NewsletterSubscriber).where(
            NewsletterSubscriber.id == subscriber_id
        )
    )

    subscriber = result.scalar_one()

    assert subscriber.active is True


# =========================================================
# DELETE /api/newsletter/unsubscribe
# =========================================================

def test_unsubscribe_success(
    active_subscriber,
):
    response = client.request(
        "DELETE",
        "/api/newsletter/unsubscribe",
        json={
            "email": active_subscriber.email
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data["message"]
        == "Successfully unsubscribed."
    )

    assert (
        data["email"]
        == active_subscriber.email
    )


def test_unsubscribe_email_not_found():
    response = client.request(
        "DELETE",
        "/api/newsletter/unsubscribe",
        json={
            "email": "missing@example.com"
        },
    )

    assert response.status_code == 404

    assert (
        response.json()["detail"]
        == "Email not found in subscriber list."
    )


def test_unsubscribe_already_inactive(
    inactive_subscriber,
):
    response = client.request(
        "DELETE",
        "/api/newsletter/unsubscribe",
        json={
            "email": inactive_subscriber.email
        },
    )

    assert response.status_code == 400

    assert (
        response.json()["detail"]
        == "This email is already unsubscribed."
    )


def test_unsubscribe_missing_email():
    response = client.request(
        "DELETE",
        "/api/newsletter/unsubscribe",
        json={},
    )

    assert response.status_code == 422


def test_unsubscribe_empty_body():
    response = client.request(
        "DELETE",
        "/api/newsletter/unsubscribe",
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    "invalid_email",
    [
        "not-an-email",
        "missing-at-sign.com",
        "@example.com",
        "user@",
        "",
    ],
)
def test_unsubscribe_invalid_email(
    invalid_email,
):
    response = client.request(
        "DELETE",
        "/api/newsletter/unsubscribe",
        json={
            "email": invalid_email
        },
    )

    assert response.status_code == 422


# =========================================================
# SOFT DELETE
# =========================================================

@pytest.mark.asyncio
async def test_unsubscribe_soft_deletes_subscriber(
    db_session,
    active_subscriber,
):
    subscriber_id = active_subscriber.id
    email = active_subscriber.email

    response = client.request(
        "DELETE",
        "/api/newsletter/unsubscribe",
        json={
            "email": email
        },
    )

    assert response.status_code == 200

    db_session.expire_all()

    result = await db_session.execute(
        select(
            NewsletterSubscriber
        ).where(
            NewsletterSubscriber.id
            == subscriber_id
        )
    )

    subscriber = (
        result.scalar_one_or_none()
    )

    # Row must still exist because unsubscribe
    # performs a soft delete.
    assert subscriber is not None

    assert subscriber.active is False


# =========================================================
# COMPLETE SUBSCRIBE -> UNSUBSCRIBE -> REACTIVATE FLOW
# =========================================================

def test_full_subscription_lifecycle():
    email = "lifecycle@example.com"

    # Subscribe
    subscribe_response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": email
        },
    )

    assert (
        subscribe_response.status_code
        == 201
    )

    subscriber_id = (
        subscribe_response.json()["id"]
    )

    assert (
        subscribe_response
        .json()["active"]
        is True
    )

    # Unsubscribe
    unsubscribe_response = client.request(
        "DELETE",
        "/api/newsletter/unsubscribe",
        json={
            "email": email
        },
    )

    assert (
        unsubscribe_response.status_code
        == 200
    )

    # Subscribe again — should reactivate
    reactivate_response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": email
        },
    )

    assert (
        reactivate_response.status_code
        == 201
    )

    data = reactivate_response.json()

    # Same database row should be reused
    assert data["id"] == subscriber_id
    assert data["active"] is True


# =========================================================
# CONTENT TYPE / ROUTE
# =========================================================

def test_subscribe_content_type():
    response = client.post(
        "/api/newsletter/subscribe",
        json={
            "email": "contenttype@example.com"
        },
    )

    assert response.status_code == 201

    assert (
        "application/json"
        in response.headers["content-type"]
    )


def test_invalid_newsletter_route():
    response = client.get(
        "/api/newsletter/invalid-route"
    )

    assert response.status_code == 404