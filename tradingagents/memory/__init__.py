"""The memory log: each decision recorded as made, settled against the market, and reflected on.

``log`` keeps the entries, ``settlement`` measures a decision's return once its
holding window has traded, and ``reflection`` turns that outcome into a lesson
the next run of the same ticker reads.
"""

from tradingagents.memory.backboard_client import BackboardAPIError, BackboardClient
from tradingagents.memory.backboard_memory import BackboardMemoryCoordinator, StructuredDecisionRecord
from tradingagents.memory.log import TradingMemoryLog

__all__ = [
    "TradingMemoryLog",
    "BackboardClient",
    "BackboardAPIError",
    "BackboardMemoryCoordinator",
    "StructuredDecisionRecord",
]
