from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CleanlinessResult:
    score: int
    status: str  # Clean / Moderate / Dirty


def compute_cleanliness_score(
    waste_count: int,
    garbage_pile_count: int,
    litter_count: int,
    human_count: int,
    vehicle_count: int,
    dustbin_count: int,
) -> CleanlinessResult:
    """
    Heuristic scoring function (0-100).
    Tune weights/thresholds as per municipal requirements.
    """
    penalty = 0
    penalty += waste_count * 12
    penalty += garbage_pile_count * 24
    penalty += litter_count * 10
    penalty += max(0, human_count - 2) * 2
    penalty += max(0, vehicle_count - 1) * 1

    bonus = 0
    bonus += min(dustbin_count, 3) * 3

    score = 100 - penalty + bonus
    score = max(0, min(100, int(round(score))))

    if score >= 80:
        status = "Clean"
    elif score >= 50:
        status = "Moderate"
    else:
        status = "Dirty"

    return CleanlinessResult(score=score, status=status)

