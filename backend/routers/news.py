from fastapi import APIRouter, Query

from services.gnews import fetch_external_news
from schemas import ExternalNewsResponse

router = APIRouter(
    prefix="/api/news",
    tags=["News"]
)


@router.get(
    "/external",
    response_model=ExternalNewsResponse
)
async def get_external_news(
    limit: int = Query(10, ge=1, le=20),
):
    """
    Returns live external news about Asian universities, pulled from GNews.
    Always returns 200 with an empty list on any failure (missing key,
    GNews down, rate-limited, etc) — external news should never break the app.
    """
    articles = await fetch_external_news(
        query=(
            "university OR \"higher education\" OR college "
            "Asia OR China OR Japan OR India OR Korea OR Singapore OR Malaysia"
        ),
        limit=limit,
    )
    return {"data": articles}