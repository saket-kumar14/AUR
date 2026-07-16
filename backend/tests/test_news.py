import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


# =========================================================
# GET /api/news/flash
# =========================================================

def test_news_flash_success():
    response = client.get(
        "/api/news/flash"
    )

    assert response.status_code == 200


def test_news_flash_default_response():
    response = client.get(
        "/api/news/flash"
    )

    assert response.status_code == 200

    data = response.json()

    assert data == {
        "data": []
    }


def test_news_flash_structure():
    response = client.get(
        "/api/news/flash"
    )

    assert response.status_code == 200

    data = response.json()

    assert "data" in data
    assert isinstance(data["data"], list)


def test_news_flash_default_limit():
    response = client.get(
        "/api/news/flash"
    )

    assert response.status_code == 200


def test_news_flash_custom_limit():
    response = client.get(
        "/api/news/flash?limit=10"
    )

    assert response.status_code == 200

    data = response.json()

    assert data == {
        "data": []
    }


def test_news_flash_minimum_limit():
    response = client.get(
        "/api/news/flash?limit=1"
    )

    assert response.status_code == 200


def test_news_flash_maximum_limit():
    response = client.get(
        "/api/news/flash?limit=20"
    )

    assert response.status_code == 200


def test_news_flash_limit_zero():
    response = client.get(
        "/api/news/flash?limit=0"
    )

    assert response.status_code == 422


def test_news_flash_limit_above_maximum():
    response = client.get(
        "/api/news/flash?limit=21"
    )

    assert response.status_code == 422


def test_news_flash_negative_limit():
    response = client.get(
        "/api/news/flash?limit=-1"
    )

    assert response.status_code == 422


def test_news_flash_invalid_limit_type():
    response = client.get(
        "/api/news/flash?limit=abc"
    )

    assert response.status_code == 422


# =========================================================
# GET /api/news
# =========================================================

def test_get_news_success():
    response = client.get(
        "/api/news"
    )

    assert response.status_code == 200


def test_get_news_default_response():
    response = client.get(
        "/api/news"
    )

    assert response.status_code == 200

    data = response.json()

    assert data == {
        "page": 1,
        "limit": 10,
        "total": 0,
        "data": [],
    }


def test_get_news_structure():
    response = client.get(
        "/api/news"
    )

    assert response.status_code == 200

    data = response.json()

    required_fields = [
        "page",
        "limit",
        "total",
        "data",
    ]

    for field in required_fields:
        assert field in data


def test_get_news_response_types():
    response = client.get(
        "/api/news"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data["page"], int)
    assert isinstance(data["limit"], int)
    assert isinstance(data["total"], int)
    assert isinstance(data["data"], list)


def test_get_news_default_pagination():
    response = client.get(
        "/api/news"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["limit"] == 10
    assert data["total"] == 0


def test_get_news_custom_page():
    response = client.get(
        "/api/news?page=2"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 2
    assert data["limit"] == 10


def test_get_news_custom_limit():
    response = client.get(
        "/api/news?limit=25"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["limit"] == 25


def test_get_news_custom_page_and_limit():
    response = client.get(
        "/api/news?page=3&limit=50"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 3
    assert data["limit"] == 50
    assert data["total"] == 0
    assert data["data"] == []


def test_get_news_minimum_values():
    response = client.get(
        "/api/news?page=1&limit=1"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["limit"] == 1


def test_get_news_maximum_limit():
    response = client.get(
        "/api/news?limit=100"
    )

    assert response.status_code == 200

    assert (
        response.json()["limit"]
        == 100
    )


# =========================================================
# INVALID PAGINATION
# =========================================================

def test_get_news_page_zero():
    response = client.get(
        "/api/news?page=0"
    )

    assert response.status_code == 422


def test_get_news_negative_page():
    response = client.get(
        "/api/news?page=-1"
    )

    assert response.status_code == 422


def test_get_news_limit_zero():
    response = client.get(
        "/api/news?limit=0"
    )

    assert response.status_code == 422


def test_get_news_negative_limit():
    response = client.get(
        "/api/news?limit=-1"
    )

    assert response.status_code == 422


def test_get_news_limit_above_maximum():
    response = client.get(
        "/api/news?limit=101"
    )

    assert response.status_code == 422


def test_get_news_invalid_page_type():
    response = client.get(
        "/api/news?page=abc"
    )

    assert response.status_code == 422


def test_get_news_invalid_limit_type():
    response = client.get(
        "/api/news?limit=abc"
    )

    assert response.status_code == 422


# =========================================================
# RESPONSE / ROUTE TESTS
# =========================================================

def test_news_content_type():
    response = client.get(
        "/api/news"
    )

    assert response.status_code == 200

    assert (
        "application/json"
        in response.headers["content-type"]
    )


def test_news_flash_content_type():
    response = client.get(
        "/api/news/flash"
    )

    assert response.status_code == 200

    assert (
        "application/json"
        in response.headers["content-type"]
    )


def test_invalid_news_route():
    response = client.get(
        "/api/news/invalid-route"
    )

    assert response.status_code == 404 