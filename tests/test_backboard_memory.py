"""Comprehensive mocked tests for Backboard persistent decision memory,
retrieval, evaluation loop, and Neutral Analyst validation.
"""

from unittest.mock import MagicMock, patch
import pytest

from tradingagents.agents.risk_mgmt.neutral_debator import create_neutral_debator
from tradingagents.memory.backboard_client import BackboardAPIError, BackboardClient
from tradingagents.memory.backboard_memory import BackboardMemoryCoordinator, StructuredDecisionRecord


# ---------------------------------------------------------------------------
# BackboardMemoryCoordinator Unit Tests
# ---------------------------------------------------------------------------

def test_backboard_disabled_by_default():
    coord = BackboardMemoryCoordinator(config={"backboard_enabled": False})
    assert not coord.is_active
    assert coord.ensure_assistant() is None
    assert coord.store_decision(MagicMock()) is False
    assert coord.retrieve_relevant_cases("NVDA") == []
    assert coord.record_evaluation_outcome("run1", "NVDA", "2026-01-01", 0.05, 0.02, "SPY", 5, "Good") is False


def test_backboard_active_with_key():
    client = MagicMock(spec=BackboardClient)
    client.is_configured = True
    coord = BackboardMemoryCoordinator(config={"backboard_enabled": True}, client=client)
    assert coord.is_active


def test_ensure_assistant_creation():
    client = MagicMock(spec=BackboardClient)
    client.is_configured = True
    client.create_assistant.return_value = {"assistant_id": "asst_trade_456"}

    coord = BackboardMemoryCoordinator(config={"backboard_enabled": True}, client=client)
    asst_id = coord.ensure_assistant()
    assert asst_id == "asst_trade_456"
    assert coord.assistant_id == "asst_trade_456"
    client.create_assistant.assert_called_once()


def test_store_decision_success():
    client = MagicMock(spec=BackboardClient)
    client.is_configured = True
    client.create_assistant.return_value = {"assistant_id": "asst_123"}
    client.send_message.return_value = {"message_id": "msg_001"}

    coord = BackboardMemoryCoordinator(config={"backboard_enabled": True}, client=client)

    record = StructuredDecisionRecord(
        run_id="NVDA_2026-10-23_001",
        ticker="NVDA",
        trade_date="2026-10-23",
        rating="Buy",
        llm_provider="ollama",
        deep_model="gemma4:e2b",
        quick_model="gemma4:e2b",
        thesis_bull="Strong AI datacenter demand",
        thesis_bear="Margin compression risk",
        trader_plan="Allocate 10% on dip",
        risk_aggressive="Scale to 15%",
        risk_conservative="Hold current cash",
        risk_neutral="Balanced 8% allocation",
        final_verdict="Initiate position with stop at -5%",
        horizon_days=5,
    )

    success = coord.store_decision(record)
    assert success is True
    client.send_message.assert_called_once()
    args, kwargs = client.send_message.call_args
    assert "NVDA_2026-10-23_001" in kwargs["content"]
    assert kwargs["memory"] == "Auto"


def test_store_decision_fail_open_on_error():
    client = MagicMock(spec=BackboardClient)
    client.is_configured = True
    client.create_assistant.return_value = {"assistant_id": "asst_123"}
    client.send_message.side_effect = BackboardAPIError("500 Server error", status_code=500)

    coord = BackboardMemoryCoordinator(config={"backboard_enabled": True}, client=client)
    record = StructuredDecisionRecord(
        run_id="run_fail",
        ticker="AAPL",
        trade_date="2026-10-23",
        rating="Hold",
    )
    # Fail-open: returns False without raising unhandled exception
    assert coord.store_decision(record) is False


def test_retrieve_relevant_cases_success():
    client = MagicMock(spec=BackboardClient)
    client.is_configured = True
    client.create_assistant.return_value = {"assistant_id": "asst_123"}
    client.search_memories.return_value = [
        {"content": "Prior NVDA breakout in 2025 followed by 12% gain.", "created_at": "2025-11-01"},
        {"content": "Bear thesis invalidation due to enterprise cloud capex.", "created_at": "2026-03-15"},
    ]

    coord = BackboardMemoryCoordinator(config={"backboard_enabled": True}, client=client)
    cases = coord.retrieve_relevant_cases("NVDA")
    assert len(cases) == 2
    assert "breakout" in cases[0]["content"]

    formatted = coord.format_memory_for_prompt(cases)
    assert "HISTORICAL PERSISTENT MEMORY" in formatted
    assert "DO NOT OVERRIDE CURRENT REAL-TIME DATA" in formatted
    assert "Prior Case #1" in formatted


def test_record_evaluation_outcome_success():
    client = MagicMock(spec=BackboardClient)
    client.is_configured = True
    client.create_assistant.return_value = {"assistant_id": "asst_123"}
    client.send_message.return_value = {"status": "ok"}

    coord = BackboardMemoryCoordinator(config={"backboard_enabled": True}, client=client)
    success = coord.record_evaluation_outcome(
        run_id="NVDA_run_1",
        ticker="NVDA",
        trade_date="2026-10-15",
        raw_return=0.082,
        alpha_return=0.045,
        benchmark="SPY",
        holding_days=5,
        evaluation_notes="Thesis fully supported by data center earnings.",
        supported_status="supported",
    )
    assert success is True
    client.send_message.assert_called_once()
    args, kwargs = client.send_message.call_args
    assert "+8.20%" in kwargs["content"]
    assert "SUPPORTED" in kwargs["content"]


# ---------------------------------------------------------------------------
# Neutral Analyst Completeness & Failure Detection Tests
# ---------------------------------------------------------------------------

def test_neutral_analyst_valid_output():
    mock_llm = MagicMock()
    mock_llm.invoke.return_value.content = "I suggest balancing aggressive upside with a conservative 7% hedge."

    node = create_neutral_debator(mock_llm)
    state = {
        "company_of_interest": "NVDA",
        "risk_debate_state": {
            "history": "",
            "neutral_history": "",
            "count": 0,
        },
        "market_report": "Bullish",
        "sentiment_report": "Positive",
        "news_report": "Neutral",
        "fundamentals_report": "Solid",
        "trader_investment_plan": "Buy 100 shares",
    }

    res = node(state)
    assert "risk_debate_state" in res
    neu_hist = res["risk_debate_state"]["neutral_history"]
    assert "Neutral Analyst: I suggest balancing aggressive upside" in neu_hist
    assert res["risk_debate_state"]["latest_speaker"] == "Neutral"


def test_neutral_analyst_empty_or_failed_output():
    mock_llm = MagicMock()
    mock_llm.invoke.return_value.content = "   "  # Empty whitespace

    node = create_neutral_debator(mock_llm)
    state = {
        "company_of_interest": "NVDA",
        "risk_debate_state": {
            "history": "",
            "neutral_history": "",
            "count": 0,
        },
        "market_report": "Bullish",
        "sentiment_report": "Positive",
        "news_report": "Neutral",
        "fundamentals_report": "Solid",
        "trader_investment_plan": "Buy 100 shares",
    }

    res = node(state)
    neu_hist = res["risk_debate_state"]["neutral_history"]
    # Never fabricated; explicitly flagged as FAILED
    assert "[FAILED - No analysis returned by LLM]" in neu_hist
