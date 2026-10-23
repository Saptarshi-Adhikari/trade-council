"""Tests for Gemma 4 configuration and optional Gemini secondary opinion."""

import os
from unittest.mock import MagicMock, patch

import pytest

from cli.gemini_opinion import get_gemini_second_opinion
from tradingagents.default_config import build_default_config
from tradingagents.llm_clients.model_catalog import MODEL_OPTIONS
from tradingagents.llm_clients.validators import validate_model


def test_gemma_model_selection_and_defaults(monkeypatch):
    """Verify Gemma 4 is properly configured as the Ollama default in environment."""
    monkeypatch.setenv("TRADINGAGENTS_LLM_PROVIDER", "ollama")
    monkeypatch.setenv("TRADINGAGENTS_QUICK_THINK_LLM", "gemma4:e2b")
    monkeypatch.setenv("TRADINGAGENTS_DEEP_THINK_LLM", "gemma4:e2b")

    config = build_default_config()
    assert config["llm_provider"] == "ollama"
    assert config["quick_think_llm"] == "gemma4:e2b"
    assert config["deep_think_llm"] == "gemma4:e2b"


def test_qwen_remains_available_recovery_model():
    """Verify that qwen2.5:7b remains a valid model for ollama."""
    assert validate_model("ollama", "qwen2.5:7b") is True
    assert validate_model("ollama", "gemma4:e2b") is True


def test_gemini_disabled_without_explicit_key(monkeypatch):
    """Verify Gemini secondary opinion returns None and does not error when key is unset."""
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    res = get_gemini_second_opinion("AAPL", "2024-05-01", {"final_trade_decision": "Hold"})
    assert res is None


def test_gemini_quota_error_does_not_block(monkeypatch):
    """Verify Gemini HTTP 429 quota exhaustion gracefully fails open without raising."""
    monkeypatch.setenv("GOOGLE_API_KEY", "test_mock_key")

    with patch("tradingagents.llm_clients.google_client.GoogleClient.get_llm") as mock_get_llm:
        mock_llm = MagicMock()
        mock_llm.invoke.side_effect = Exception("429 RESOURCE_EXHAUSTED: quota exceeded")
        mock_get_llm.return_value = mock_llm

        res = get_gemini_second_opinion("AAPL", "2024-05-01", {"final_trade_decision": "Hold"})
        assert res is None


def test_gemini_successful_second_opinion(monkeypatch):
    """Verify Gemini second opinion formatting when a valid response is returned."""
    monkeypatch.setenv("GOOGLE_API_KEY", "test_mock_key")

    with patch("tradingagents.llm_clients.google_client.GoogleClient.get_llm") as mock_get_llm:
        mock_llm = MagicMock()
        mock_resp = MagicMock()
        mock_resp.content = "I agree with the Hold decision due to compressed volatility."
        mock_llm.invoke.return_value = mock_resp
        mock_get_llm.return_value = mock_llm

        res = get_gemini_second_opinion("AAPL", "2024-05-01", {"final_trade_decision": "Hold"})
        assert res == "I agree with the Hold decision due to compressed volatility."


def test_no_automatic_cloud_fallback(monkeypatch):
    """Verify provider does not silently switch away from ollama."""
    monkeypatch.setenv("TRADINGAGENTS_LLM_PROVIDER", "ollama")
    config = build_default_config()
    assert config["llm_provider"] == "ollama"
