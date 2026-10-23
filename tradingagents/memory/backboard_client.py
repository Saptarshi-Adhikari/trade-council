"""Isolated Backboard.io REST API Client for TRADECOUNCIL.

Handles authentication, timeouts, bounded retries with exponential backoff,
and safe fail-open error handling. Never logs or serializes API keys.
"""

import logging
import os
import time
from typing import Any, Dict, List, Optional
import requests

logger = logging.getLogger(__name__)

DEFAULT_BACKBOARD_BASE_URL = "https://app.backboard.io/api"
DEFAULT_TIMEOUT_SECONDS = 10.0
DEFAULT_MAX_RETRIES = 3


class BackboardAPIError(Exception):
    """Base exception for Backboard API errors."""

    def __init__(self, message: str, status_code: Optional[int] = None, response_body: Optional[str] = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


class BackboardClient:
    """Client for Backboard.io conversational memory API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT_SECONDS,
        max_retries: int = DEFAULT_MAX_RETRIES,
        session: Optional[requests.Session] = None,
    ):
        self.api_key = api_key or os.getenv("BACKBOARD_API_KEY", "")
        self.base_url = (base_url or os.getenv("BACKBOARD_BASE_URL", DEFAULT_BACKBOARD_BASE_URL)).rstrip("/")
        self.timeout = float(timeout)
        self.max_retries = int(max_retries)
        self._session = session or requests.Session()

    @property
    def is_configured(self) -> bool:
        """Returns True if the client has an API key configured."""
        return bool(self.api_key and self.api_key.strip())

    def _headers(self) -> Dict[str, str]:
        return {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
            "User-Agent": "TradeCouncil-Backboard-Client/1.0",
        }

    def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        if not self.is_configured:
            raise BackboardAPIError("Backboard API key is missing or not configured.", status_code=401)

        url = f"{self.base_url}/{path.lstrip('/')}"
        attempt = 0
        backoff = 0.5

        while attempt < self.max_retries:
            attempt += 1
            try:
                response = self._session.request(
                    method=method.upper(),
                    url=url,
                    headers=self._headers(),
                    params=params,
                    json=json_data,
                    timeout=self.timeout,
                )

                # Success
                if 200 <= response.status_code < 300:
                    try:
                        return response.json() if response.content else {}
                    except ValueError as exc:
                        raise BackboardAPIError(f"Malformed JSON response from Backboard: {exc}", status_code=response.status_code)

                # Unrecoverable auth failure
                if response.status_code in (401, 403):
                    raise BackboardAPIError(
                        f"Authentication failed for Backboard API (HTTP {response.status_code})",
                        status_code=response.status_code,
                        response_body=response.text[:200],
                    )

                # Rate limiting or server errors retry with exponential backoff
                if response.status_code in (429, 500, 502, 503, 504):
                    if attempt < self.max_retries:
                        time.sleep(backoff)
                        backoff *= 2.0
                        continue
                    raise BackboardAPIError(
                        f"Backboard API request failed after {attempt} attempts (HTTP {response.status_code})",
                        status_code=response.status_code,
                        response_body=response.text[:200],
                    )

                # Other 4xx client errors
                raise BackboardAPIError(
                    f"Backboard client error: HTTP {response.status_code}",
                    status_code=response.status_code,
                    response_body=response.text[:200],
                )

            except requests.exceptions.Timeout as exc:
                if attempt < self.max_retries:
                    time.sleep(backoff)
                    backoff *= 2.0
                    continue
                raise BackboardAPIError(f"Backboard request timed out after {attempt} attempts: {exc}")
            except requests.exceptions.RequestException as exc:
                if attempt < self.max_retries:
                    time.sleep(backoff)
                    backoff *= 2.0
                    continue
                raise BackboardAPIError(f"Network error communicating with Backboard: {exc}")

        raise BackboardAPIError("Maximum retries exceeded communicating with Backboard API.")

    # --- Assistants API ---

    def create_assistant(
        self,
        name: str,
        system_prompt: str,
        custom_fact_extraction_prompt: Optional[str] = None,
        custom_update_memory_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create or configure an assistant profile."""
        payload: Dict[str, Any] = {
            "name": name,
            "system_prompt": system_prompt,
        }
        if custom_fact_extraction_prompt:
            payload["custom_fact_extraction_prompt"] = custom_fact_extraction_prompt
        if custom_update_memory_prompt:
            payload["custom_update_memory_prompt"] = custom_update_memory_prompt

        return self._request("POST", "/assistants", json_data=payload)

    def get_assistant(self, assistant_id: str) -> Dict[str, Any]:
        """Fetch assistant details."""
        return self._request("GET", f"/assistants/{assistant_id}")

    # --- Threads & Messages API ---

    def create_thread(self, assistant_id: str) -> Dict[str, Any]:
        """Create a new thread attached to an assistant."""
        return self._request("POST", "/threads", json_data={"assistant_id": assistant_id})

    def send_message(
        self,
        content: str,
        assistant_id: Optional[str] = None,
        thread_id: Optional[str] = None,
        memory: str = "Auto",
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a message to a thread or assistant.
        
        Args:
            content: Message body.
            assistant_id: Target assistant profile.
            thread_id: Specific conversation thread.
            memory: 'Auto' (extract + recall), 'Readonly' (recall only), or 'off'.
            system_prompt: Optional runtime override.
        """
        payload: Dict[str, Any] = {
            "content": content,
            "memory": memory,
        }
        if assistant_id:
            payload["assistant_id"] = assistant_id
        if thread_id:
            payload["thread_id"] = thread_id
        if system_prompt:
            payload["system_prompt"] = system_prompt

        return self._request("POST", "/threads/messages", json_data=payload)

    # --- Long-term Memories API ---

    def list_memories(self, assistant_id: str, page: int = 1, page_size: int = 25) -> List[Dict[str, Any]]:
        """List long-term memories for an assistant."""
        res = self._request("GET", f"/assistants/{assistant_id}/memories", params={"page": page, "page_size": page_size})
        if isinstance(res, list):
            return res
        return res.get("memories") or res.get("items") or []

    def search_memories(self, assistant_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Semantic search over an assistant's long-term memory."""
        res = self._request("POST", f"/assistants/{assistant_id}/memories/search", json_data={"query": query, "limit": limit})
        if isinstance(res, list):
            return res
        return res.get("memories") or res.get("results") or []
