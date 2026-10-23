"""Optional Gemini second opinion helper for TradingAgents.

Provides an isolated, quota-safe secondary opinion on a completed Gemma analysis.
- Off by default
- At most 1 Gemini API call per run
- Never replaces the primary Gemma decision
- Fails open on missing credentials, 429 quota exhaustion, or API errors
"""

import os
from typing import Any

from cli.display import console


def get_gemini_second_opinion(
    ticker: str,
    analysis_date: str,
    final_state: dict[str, Any],
    model: str = "gemini-3.5-flash-lite",
) -> str | None:
    """Request a quota-safe second opinion from Gemini on the completed analysis.

    Returns the second opinion text if successful, or None if disabled/failed.
    """
    # 1. Inspect environment variable for Google API key
    google_api_key = os.environ.get("GOOGLE_API_KEY")
    if not google_api_key or not google_api_key.strip():
        console.print("[dim]Gemini second opinion: GOOGLE_API_KEY unset. Skipping.[/dim]")
        return None

    # 2. Extract final decision details from Gemma analysis
    decision = final_state.get("final_trade_decision") or ""
    rating = final_state.get("rating") or "Unrated"
    investment_plan = final_state.get("investment_plan") or ""

    prompt = (
        f"You are providing an independent second opinion on a completed financial trading analysis.\n\n"
        f"Asset: {ticker}\n"
        f"Analysis Date: {analysis_date}\n"
        f"Primary Model Decision (Gemma):\n"
        f"Rating: {rating}\n"
        f"Research Plan Summary: {investment_plan[:1000]}\n"
        f"Final Trade Decision: {decision[:1500]}\n\n"
        f"Please provide a concise second opinion evaluating this decision: "
        f"do you agree, disagree, or recommend adjustments to risk/sizing? Keep response to 2-3 short paragraphs."
    )

    try:
        from tradingagents.llm_clients.google_client import GoogleClient

        client = GoogleClient(model=model, google_api_key=google_api_key)
        llm = client.get_llm()
        response = llm.invoke(prompt)
        content = getattr(response, "content", None)
        if isinstance(content, list):
            # Normalization helper for multi-block content
            text = "".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in content)
        else:
            text = str(content or "")

        console.print(f"\n[bold green]✓ Gemini Second Opinion received ({model})[/bold green]\n")
        return text.strip()
    except Exception as exc:
        # Gracefully fail open on quota, network, or auth errors without retrying
        err_msg = str(exc)
        if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower():
            console.print("[yellow]Gemini second opinion skipped: Quota limit reached (HTTP 429). Continuing with Gemma decision only.[/yellow]")
        elif "API_KEY" in err_msg or "auth" in err_msg.lower():
            console.print("[yellow]Gemini second opinion skipped: Invalid or unauthorized GOOGLE_API_KEY. Continuing with Gemma decision only.[/yellow]")
        else:
            console.print(f"[yellow]Gemini second opinion skipped: {err_msg}. Continuing with Gemma decision only.[/yellow]")
        return None
