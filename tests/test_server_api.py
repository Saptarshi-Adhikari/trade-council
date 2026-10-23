"""Lightweight direct unit tests for server endpoint functions."""

from unittest.mock import MagicMock, patch
import pytest

from cli.server import (
    health,
    get_public_config,
    start_analysis,
    get_analysis_status,
    get_history,
    AnalysisRequest,
    JOBS,
)


def test_health_endpoint():
    res = health()
    assert res["status"] == "healthy"
    assert "TRADECOUNCIL" in res["service"]


def test_config_endpoint():
    res = get_public_config()
    assert "llm_provider" in res
    assert "quick_model" in res
    assert "deep_model" in res


def test_start_analysis_and_poll_status():
    req = AnalysisRequest(ticker="RELIANCE.NS", analysis_date="2024-10-18")
    mock_bg = MagicMock()

    with patch("cli.server.executor.submit") as mock_submit:
        res = start_analysis(req, mock_bg)
        assert "analysis_id" in res
        assert res["status"] == "queued"

        analysis_id = res["analysis_id"]
        status = get_analysis_status(analysis_id)
        assert status["ticker"] == "RELIANCE.NS"
        assert status["status"] == "queued"


def test_get_history_endpoint():
    res = get_history()
    assert "records" in res
    assert isinstance(res["records"], list)
