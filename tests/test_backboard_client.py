"""Unit and resilience tests for BackboardClient."""

import pytest
import requests
from unittest.mock import MagicMock, patch

from tradingagents.memory.backboard_client import (
    BackboardClient,
    BackboardAPIError,
    DEFAULT_BACKBOARD_BASE_URL,
)


def test_client_not_configured():
    client = BackboardClient(api_key="")
    assert not client.is_configured
    with pytest.raises(BackboardAPIError) as exc_info:
        client.create_assistant(name="Test", system_prompt="Test")
    assert exc_info.value.status_code == 401


def test_client_configured():
    client = BackboardClient(api_key="bb_secret_12345")
    assert client.is_configured
    assert client._headers()["X-API-Key"] == "bb_secret_12345"


def test_client_successful_request():
    mock_session = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = b'{"assistant_id": "asst_123"}'
    mock_resp.json.return_value = {"assistant_id": "asst_123"}
    mock_session.request.return_value = mock_resp

    client = BackboardClient(api_key="bb_key", session=mock_session)
    res = client.create_assistant(name="Trader", system_prompt="Trading System")
    assert res == {"assistant_id": "asst_123"}
    mock_session.request.assert_called_once()
    args, kwargs = mock_session.request.call_args
    assert kwargs["url"] == f"{DEFAULT_BACKBOARD_BASE_URL}/assistants"
    assert kwargs["json"]["name"] == "Trader"


def test_client_auth_failure_401():
    mock_session = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.text = "Unauthorized"
    mock_session.request.return_value = mock_resp

    client = BackboardClient(api_key="invalid_key", session=mock_session)
    with pytest.raises(BackboardAPIError) as exc_info:
        client.get_assistant("asst_123")
    assert exc_info.value.status_code == 401
    assert "Authentication failed" in str(exc_info.value)


def test_client_rate_limiting_429_retry_exhausted():
    mock_session = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.text = "Rate limit exceeded"
    mock_session.request.return_value = mock_resp

    client = BackboardClient(api_key="bb_key", session=mock_session, max_retries=2)
    with pytest.raises(BackboardAPIError) as exc_info:
        client.send_message(content="Hello", assistant_id="asst_123")
    assert exc_info.value.status_code == 429
    assert mock_session.request.call_count == 2


def test_client_timeout_handling():
    mock_session = MagicMock()
    mock_session.request.side_effect = requests.exceptions.Timeout("Connection timed out")

    client = BackboardClient(api_key="bb_key", session=mock_session, max_retries=2)
    with pytest.raises(BackboardAPIError) as exc_info:
        client.search_memories(assistant_id="asst_123", query="NVDA break out")
    assert "timed out" in str(exc_info.value)
    assert mock_session.request.call_count == 2


def test_client_malformed_json_handling():
    mock_session = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = b"Not valid json"
    mock_resp.json.side_effect = ValueError("Invalid JSON")
    mock_session.request.return_value = mock_resp

    client = BackboardClient(api_key="bb_key", session=mock_session)
    with pytest.raises(BackboardAPIError) as exc_info:
        client.list_memories(assistant_id="asst_123")
    assert "Malformed JSON" in str(exc_info.value)
