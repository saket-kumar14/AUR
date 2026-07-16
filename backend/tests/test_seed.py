import sys
import os
import pytest
import pandas as pd
from unittest.mock import patch
from sqlalchemy import select

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from database.seed import seed, safe_float, safe_int
from database.models import University, RankingScore

def test_seed_helpers():
    # Test float safety checks
    assert safe_float("92.3") == 92.3
    assert safe_float("invalid") is None
    assert safe_float(None) is None

    # Test int safety checks (removing '=' prefix and parsing)
    assert safe_int("=4") == 4
    assert safe_int(123) == 123
    assert safe_int(None) is None


@pytest.mark.asyncio
async def test_seed_process_database(db_session):
    # Mock dataframe containing realistic data including nulls to verify parsing/handling
    mock_df = pd.DataFrame({
        "index": [1, 2],
        "rank_2026": ["=3", "10"],
        "rank_2025": ["5", None], # Contains a Null/None for 2025 rank
        "institution": ["Test University India", "Test University Singapore"],
        "country": ["India", "Singapore"],
        "subregion": ["Southern Asia", "Southeastern Asia"],
        "subregional_rank": [1, 2],
        "size": ["L", "M"],
        "focus": ["FC", "CO"],
        "research_level": ["VH", "HI"],
        "status": ["Public", "Private"],
        "ar_score": [90.0, None],  # One score populated, one None/Null
        "ar_rank": [3, None],
        "er_score": [85.0, 70.0],
        "er_rank": [4, 15],
        "fsr_score": [80.0, None],
        "fsr_rank": [5, None],
        "irn_score": [75.0, None],
        "irn_rank": [6, None],
        "cpp_score": [70.0, None],
        "cpp_rank": [7, None],
        "ppf_score": [65.0, None],
        "ppf_rank": [8, None],
        "swp_score": [60.0, None],
        "swp_rank": [9, None],
        "ifr_score": [55.0, None],
        "ifr_rank": [10, None],
        "isr_score": [50.0, None],
        "isr_rank": [11, None],
        "inbound_score": [45.0, None],
        "inbound_rank": [12, None],
        "outbound_score": [40.0, None],
        "outbound_rank": [13, None],
        "overall_score": [88.5, None],
    })

    # Run the seed database engine loading mock_df
    with patch("database.seed.load_dataframe", return_value=mock_df):
        await seed(db_session)

        # Check total rows of universities in test Database
        result_unis = await db_session.execute(select(University))
        unis = result_unis.scalars().all()
        assert len(unis) == 2

        # Verify attributes and mappings
        uni_india = next(u for u in unis if u.name == "Test University India")
        assert uni_india.country == "India"
        assert uni_india.is_public is True

        # Check corresponding ranking scores for 2026
        result_score_2026 = await db_session.execute(
            select(RankingScore).where(
                RankingScore.university_id == uni_india.id,
                RankingScore.year == 2026
            )
        )
        score_2026 = result_score_2026.scalar_one()
        assert score_2026.rank == 3
        assert score_2026.ar_score == 90.0

        # Check handling of null values
        uni_sing = next(u for u in unis if u.name == "Test University Singapore")
        result_score_sing = await db_session.execute(
            select(RankingScore).where(
                RankingScore.university_id == uni_sing.id,
                RankingScore.year == 2026
            )
        )
        score_sing = result_score_sing.scalar_one()
        assert score_sing.rank == 10
        assert score_sing.ar_score is None  # Handled null correctly
