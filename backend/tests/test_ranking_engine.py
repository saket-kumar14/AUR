import sys
import os
import pytest
from typing import Optional

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from engine.ranking_engine import compute_weighted_score, assign_ranks

def test_weighted_score_calculation():
    # Verify weighted score matching known inputs
    # Let's mock a simple weights config
    mock_weights = {
        "ar_score": 0.3,
        "er_score": 0.2,
        "fsr_score": 0.5
    }
    
    mock_scores = {
        "ar_score": 90.0,
        "er_score": 80.0,
        "fsr_score": 100.0,
        "other_score": 50.0  # Should be ignored since it's not in the weights dict
    }
    
    expected = (90.0 * 0.3) + (80.0 * 0.2) + (100.0 * 0.5)  # 27 + 16 + 50 = 93.0
    result = compute_weighted_score(mock_scores, weights=mock_weights)
    assert result == expected

    # Test handling where some scores are missing (None)
    mock_scores_partial = {
        "ar_score": 90.0,
        "er_score": None,
        "fsr_score": 100.0
    }
    # Expected weighted sum: (90 * 0.3) + (100 * 0.5) = 77.0. Total weights accounted for: 0.3 + 0.5 = 0.8.
    # Result: 77.0 / 0.8 = 96.25 -> rounded to 96.25 (or 2 decimal places: 96.25)
    result_partial = compute_weighted_score(mock_scores_partial, weights=mock_weights)
    assert result_partial == 96.25


def test_ranking_ties_and_bands():
    # 1. Test that ties get '=' prefix
    # Under 700, ties should have "=" prepended if count > 1
    scores = [
        ("uni_A", 95.0),
        ("uni_B", 90.0),
        ("uni_C", 90.0),  # Tiess starting at rank 2
        ("uni_D", 85.0)
    ]
    
    ranks = assign_ranks(scores)
    assert ranks["uni_A"] == "1"
    assert ranks["uni_B"] == "=2"
    assert ranks["uni_C"] == "=2"
    assert ranks["uni_D"] == "4"

    # 2. Test that band ranks work correctly for positions >= 701
    # Positions 701 to 710 get "701-710"
    # Create 705 universities with distinct scores
    scores_band = []
    # Fill first 700 with high distinct scores
    for idx in range(700):
        scores_band.append((f"uni_{idx}", 1000.0 - idx))
    
    # Add a university at position 701, 702
    scores_band.append(("uni_701", 10.0))
    scores_band.append(("uni_702", 9.0))
    
    ranks_band = assign_ranks(scores_band)
    
    assert ranks_band["uni_0"] == "1"
    assert ranks_band["uni_701"] == "701-710"
    assert ranks_band["uni_702"] == "701-710"
