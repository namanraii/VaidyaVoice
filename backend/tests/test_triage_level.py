"""Unit tests for determine_triage_level (pure logic, no Neo4j or Sarvam calls)."""
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.schemas import ConditionResult, TriageLevel  # noqa: E402
from app.services.triage_engine import determine_triage_level  # noqa: E402


def cond(name="X", severity=0.3, emergency=False):
    return ConditionResult(
        name=name,
        severity_score=severity,
        is_emergency=emergency,
        matched_score=1.0,
        matched_symptoms=[],
        confidence=0.5,
    )


def test_high_urgency_is_red_even_without_conditions():
    assert determine_triage_level("high", ["chest pain"], []) == (TriageLevel.RED, True)


def test_no_conditions_low_urgency_is_green():
    assert determine_triage_level("low", [], []) == (TriageLevel.GREEN, False)


def test_medium_urgency_without_conditions_is_yellow():
    assert determine_triage_level("medium", ["fever"], []) == (TriageLevel.YELLOW, False)


def test_emergency_condition_with_two_symptoms_is_red():
    conditions = [cond(severity=0.4), cond(emergency=True, severity=0.9)]
    assert determine_triage_level("low", ["fever", "stiff neck"], conditions) == (TriageLevel.RED, True)


def test_emergency_condition_with_single_symptom_low_urgency_is_not_red():
    conditions = [cond(emergency=True, severity=0.9)]
    level, emergency = determine_triage_level("low", ["headache"], conditions)
    assert emergency is False
    assert level == TriageLevel.YELLOW  # top severity 0.9 >= 0.5


def test_single_symptom_severe_top_condition_medium_urgency_is_red():
    conditions = [cond(emergency=True, severity=0.8)]
    assert determine_triage_level("medium", ["chest pain"], conditions) == (TriageLevel.RED, True)


def test_single_symptom_just_below_severe_threshold_stays_yellow():
    conditions = [cond(emergency=True, severity=0.79)]
    assert determine_triage_level("medium", ["chest pain"], conditions) == (TriageLevel.YELLOW, False)


def test_two_symptoms_without_emergency_condition_is_not_red():
    conditions = [cond(severity=0.2)]
    assert determine_triage_level("low", ["cough", "cold"], conditions) == (TriageLevel.GREEN, False)


@pytest.mark.parametrize("severity,expected", [(0.49, TriageLevel.GREEN), (0.5, TriageLevel.YELLOW)])
def test_top_condition_severity_threshold_for_yellow(severity, expected):
    assert determine_triage_level("low", ["cough"], [cond(severity=severity)]) == (expected, False)


def test_only_top_condition_severity_drives_yellow():
    conditions = [cond(severity=0.1), cond(severity=0.95)]
    assert determine_triage_level("low", ["cough"], conditions) == (TriageLevel.GREEN, False)
