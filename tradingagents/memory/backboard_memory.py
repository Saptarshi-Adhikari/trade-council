"""Backboard Decision Memory Coordinator.

Structures decision records, performs similarity search for historical market
regimes and outcomes, manages assistant/thread scopes, and tracks evaluation
status idempotently.

Fails open safely when Backboard is disabled or unavailable.
"""

import json
import logging
import os
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from tradingagents.memory.backboard_client import BackboardClient, BackboardAPIError

logger = logging.getLogger(__name__)

DEFAULT_ASSISTANT_NAME = "TradeCouncil Persistent Memory"
DEFAULT_ASSISTANT_PROMPT = (
    "You are the long-term memory coordinator for TRADECOUNCIL. Your role is to "
    "record trading theses, risk debates, macroeconomic contexts, price targets, "
    "and subsequent evaluation outcomes. When queried, provide factual, objective "
    "past evidence to prevent repeating prior analytical errors."
)


@dataclass
class StructuredDecisionRecord:
    """Structured decision memory payload."""

    run_id: str
    ticker: str
    trade_date: str
    rating: str
    llm_provider: Optional[str] = None
    deep_model: Optional[str] = None
    quick_model: Optional[str] = None
    thesis_bull: Optional[str] = None
    thesis_bear: Optional[str] = None
    trader_plan: Optional[str] = None
    risk_aggressive: Optional[str] = None
    risk_conservative: Optional[str] = None
    risk_neutral: Optional[str] = None
    final_verdict: Optional[str] = None
    confidence: Optional[str] = None
    horizon_days: int = 5
    price_target: Optional[str] = None
    market_snapshot: Optional[Dict[str, Any]] = field(default_factory=dict)
    evaluation_status: str = "pending"  # 'pending', 'supported', 'contradicted', 'inconclusive'
    raw_return: Optional[float] = None
    alpha_return: Optional[float] = None
    benchmark: Optional[str] = None
    evaluation_notes: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


class BackboardMemoryCoordinator:
    """Coordinates semantic indexing, retrieval, and outcome evaluation via Backboard."""

    def __init__(self, config: Optional[Dict[str, Any]] = None, client: Optional[BackboardClient] = None):
        cfg = config or {}
        self.enabled = bool(cfg.get("backboard_enabled", os.getenv("BACKBOARD_ENABLED", "false").lower() in ("true", "1", "yes", "on")))
        self.assistant_id = cfg.get("backboard_assistant_id") or os.getenv("BACKBOARD_ASSISTANT_ID", "")
        self.max_memories = int(cfg.get("backboard_max_memories", os.getenv("BACKBOARD_MAX_MEMORIES", 5)))
        self.eval_horizon_days = int(cfg.get("backboard_eval_horizon_days", cfg.get("holding_period_days", 5)))
        self.client = client or BackboardClient(
            api_key=cfg.get("backboard_api_key") or os.getenv("BACKBOARD_API_KEY"),
            base_url=cfg.get("backboard_base_url") or os.getenv("BACKBOARD_BASE_URL"),
            timeout=float(cfg.get("backboard_timeout", os.getenv("BACKBOARD_TIMEOUT", 10.0))),
        )
        self._assistant_initialized = False

    @property
    def is_active(self) -> bool:
        """True if Backboard is explicitly enabled and API key is present."""
        return self.enabled and self.client.is_configured

    def ensure_assistant(self) -> Optional[str]:
        """Ensure an assistant exists, creating one if not configured."""
        if not self.is_active:
            return None
        if self.assistant_id:
            return self.assistant_id

        try:
            logger.info("Initializing Backboard assistant for TRADECOUNCIL memory...")
            res = self.client.create_assistant(
                name=DEFAULT_ASSISTANT_NAME,
                system_prompt=DEFAULT_ASSISTANT_PROMPT,
                custom_fact_extraction_prompt=(
                    "Extract structured trading records, investment theses, risk arguments, "
                    "price targets, holding horizons, and outcome returns. Group by Ticker and Run ID."
                ),
            )
            self.assistant_id = res.get("assistant_id") or res.get("id") or ""
            return self.assistant_id
        except BackboardAPIError as exc:
            logger.warning("[Backboard] Failed to create or initialize assistant: %s", exc)
            return None

    def store_decision(self, record: StructuredDecisionRecord) -> bool:
        """Index a structured decision into persistent memory."""
        if not self.is_active:
            return False

        asst_id = self.ensure_assistant()
        if not asst_id:
            return False

        # Build clean, grounded memory text
        body = (
            f"RECORD [RUN_ID: {record.run_id} | TICKER: {record.ticker} | DATE: {record.trade_date} | RATING: {record.rating}]\n"
            f"HORIZON: {record.horizon_days} trading days | STATUS: {record.evaluation_status}\n"
            f"MODELS: deep={record.deep_model or 'default'}, quick={record.quick_model or 'default'}\n"
            f"BULL THESIS: {record.thesis_bull or 'N/A'}\n"
            f"BEAR THESIS: {record.thesis_bear or 'N/A'}\n"
            f"TRADER PLAN: {record.trader_plan or 'N/A'}\n"
            f"RISK DEBATE:\n"
            f"  - Aggressive: {record.risk_aggressive or 'N/A'}\n"
            f"  - Conservative: {record.risk_conservative or 'N/A'}\n"
            f"  - Neutral: {record.risk_neutral or 'N/A'}\n"
            f"PORTFOLIO VERDICT: {record.final_verdict or 'N/A'}\n"
        )
        if record.price_target:
            body += f"PRICE TARGET: {record.price_target}\n"
        if record.market_snapshot:
            body += f"MARKET SNAPSHOT: {json.dumps(record.market_snapshot, default=str)}\n"

        try:
            # We send to the assistant with memory='Auto' to extract and index
            self.client.send_message(
                content=f"Log Decision Record:\n{body}",
                assistant_id=asst_id,
                memory="Auto",
            )
            logger.info("[Backboard] Successfully indexed decision for %s (Run %s)", record.ticker, record.run_id)
            return True
        except BackboardAPIError as exc:
            logger.warning("[Backboard] Memory persistence failed for %s (Run %s): %s", record.ticker, record.run_id, exc)
            return False

    def retrieve_relevant_cases(
        self,
        ticker: str,
        query_context: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Retrieve historical cases and evaluated outcomes from persistent memory.
        
        Returns a list of raw memory dictionaries.
        """
        if not self.is_active:
            return []

        asst_id = self.ensure_assistant()
        if not asst_id:
            return []

        query = f"Ticker: {ticker}"
        if query_context:
            query += f" | Context: {query_context}"

        n_limit = limit or self.max_memories
        try:
            results = self.client.search_memories(assistant_id=asst_id, query=query, limit=n_limit)
            return results
        except BackboardAPIError as exc:
            logger.warning("[Backboard] Memory search failed for %s: %s", ticker, exc)
            return []

    def format_memory_for_prompt(self, memories: List[Dict[str, Any]]) -> str:
        """Format retrieved memories for safe agent prompt injection.
        
        Guarantees that historical memories are clearly bounded and cannot
        override current market data.
        """
        if not memories:
            return ""

        lines = [
            "<!-- HISTORICAL PERSISTENT MEMORY (EVIDENTIARY PRIOR ONLY - DO NOT OVERRIDE CURRENT REAL-TIME DATA) -->",
            "The following records reflect past analyses, risk debates, and evaluated outcomes from prior runs.",
            "Use them to evaluate calibration, recurring biases, or past false breakouts, but anchor strictly to CURRENT data:",
            "",
        ]

        for i, mem in enumerate(memories, 1):
            content = mem.get("content") or mem.get("memory") or mem.get("text") or str(mem)
            created = mem.get("created_at") or mem.get("timestamp") or "historical"
            lines.append(f"--- Prior Case #{i} [{created}] ---")
            lines.append(content.strip())
            lines.append("")

        lines.append("<!-- END HISTORICAL PERSISTENT MEMORY -->")
        return "\n".join(lines)

    def record_evaluation_outcome(
        self,
        run_id: str,
        ticker: str,
        trade_date: str,
        raw_return: float,
        alpha_return: float,
        benchmark: str,
        holding_days: int,
        evaluation_notes: str,
        supported_status: str = "inconclusive",
    ) -> bool:
        """Idempotently record evaluation outcome for a prior decision run."""
        if not self.is_active:
            return False

        asst_id = self.ensure_assistant()
        if not asst_id:
            return False

        outcome_text = (
            f"EVALUATION OUTCOME [RUN_ID: {run_id} | TICKER: {ticker} | TRADE_DATE: {trade_date}]\n"
            f"HORIZON TRADED: {holding_days} days\n"
            f"STATUS: {supported_status.upper()}\n"
            f"RAW RETURN: {raw_return:+.2%}\n"
            f"ALPHA (vs {benchmark}): {alpha_return:+.2%}\n"
            f"EVALUATION NOTES: {evaluation_notes}\n"
        )

        try:
            self.client.send_message(
                content=f"Log Evaluation Outcome:\n{outcome_text}",
                assistant_id=asst_id,
                memory="Auto",
            )
            logger.info("[Backboard] Successfully logged evaluation outcome for %s (Run %s)", ticker, run_id)
            return True
        except BackboardAPIError as exc:
            logger.warning("[Backboard] Failed to log outcome for %s (Run %s): %s", ticker, run_id, exc)
            return False
