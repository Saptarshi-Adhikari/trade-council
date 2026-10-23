# TRADECOUNCIL

**TRADECOUNCIL** is an autonomous, multi-agent financial deliberation system that simulates an institutional investment committee. Instead of a single monolithic prompt, it structures decision-making across specialized adversarial agents built on a LangGraph state machine:

1. **Analyst Team** — gathers ground-truth market, fundamental, sentiment, and news data (parallel execution).
2. **Research Team** — a structured **Bull vs. Bear** debate moderated by a **Research Manager**.
3. **Trader** — synthesizes the research plan into concrete actions, price targets, and entry/exit levels.
4. **Risk Management Team** — stress-tests the trader's plan through **Aggressive**, **Conservative**, and **Neutral** risk perspectives.
5. **Portfolio Manager** — issues the final verdict (**Buy / Hold / Sell / Overweight / Underweight**) with an executive rationale.

<p align="center">
  <img src="assets/schema.png" width="90%" alt="TRADECOUNCIL pipeline">
</p>

TRADECOUNCIL's headline differentiator from upstream: it is wired for **100% private, zero-token-cost local execution**.

- **Local Brain**: runs by default on [Ollama](https://ollama.com/) with Google's open-weight **Gemma 4** (`gemma4:e2b`), with **Qwen 2.5 7B** (`qwen2.5:7b`) as an established baseline and recovery option. No cloud keys are required to produce a full council decision.
- **Optional Secondary Opinion**: an isolated, quota-safe **Gemini 3.5 Flash Lite** critique (`--gemini-second-opinion`) that never alters or blocks the local verdict — it fails open and is capped at one call.
- **Web Terminal & API**: a Vite-React web terminal UI, a FastAPI backend (`api/index.py`), and a persistent "Backboard" memory, configured for multi-service deployment on Vercel.

## Detailed Documentation

- [WORKFLOW.md](WORKFLOW.md) — full system architecture, real code execution path, model inventory, provider/agent routing, CLI argument reference, data providers, `.env` configuration, programmatic report structure, error & recovery playbook, and the feature status matrix.
- [UPSTREAM_COMPARISON.md](UPSTREAM_COMPARISON.md) — lineage baseline vs. Tauric Research's *TradingAgents*, verified improvements, inherited components.

## Architecture Overview

```
User CLI input (ticker, date, flags)
   └─> Environment loading (dotenv -> DEFAULT_CONFIG)
        └─> TradingAgentsGraph (LangGraph state machine)
             ├─ Market Analyst (yfinance technicals)   ┐ (parallel)
             └─ News / Sentiment / Fundamentals        ┘
                  └─> Bull vs Bear Research Debate
                       └─> Research Manager Verdict
                            └─> Trader Investment Plan
                                 └─> Risk Debate (Aggressive / Conservative / Neutral)
                                      └─> Portfolio Manager Final Verdict
                                           ├─> Primary reports (Markdown + HTML report trees saved locally)
                                           └─> Optional Gemini second opinion (isolated critique only)
```

All structural artwork (`schema.png`, phase diagrams) is inherited from the upstream framework; see the Attribution section below.

## Installation

TRADECOUNCIL needs **Python 3.11+**. Clone and install:

```bash
git clone https://github.com/Saptarshi-Adhikari/trade-council.git
cd trade-council

# conda
conda create -n tradecouncil python=3.11
conda activate tradecouncil
pip install .

# or with uv
uv venv --python 3.11
. .venv/Scripts/activate   # Windows
uv pip install .
```

Or run with Docker:

```bash
cp .env.example .env   # add API keys (optional if going 100% local)
docker compose run --rm tradingagents
```

## Running 100% Locally

1. Install [Ollama](https://ollama.com/) and pull the models:

```bash
ollama pull gemma4:e2b
ollama pull qwen2.5:7b    # optional baseline / recovery model
```

2. Configure `.env` (leave all cloud keys **empty** for pure local operation):

```env
# Local Ollama endpoint
OLLAMA_BASE_URL=http://localhost:11434/v1

# Primary provider and models
TRADINGAGENTS_LLM_PROVIDER=ollama

# Unattended execution (skip CLI prompts)
TRADINGAGENTS_OUTPUT_LANGUAGE=English
TRADINGAGENTS_MAX_DEBATE_ROUNDS=1
TRADINGAGENTS_MAX_RISK_ROUNDS=1
```

3. Run the council via CLI:

```bash
# Verified CLI command
python -m cli.main --ticker AAPL --date 2024-05-01 --analysts market --save --no-show --html --no-checkpoint

# Or launch the interactive CLI
tradingagents
```

Key CLI arguments (full reference in [WORKFLOW.md](WORKFLOW.md)):

| Argument | Purpose |
|---|---|
| `--ticker AAPL` | Asset symbol to analyze (skips prompt) |
| `--date YYYY-MM-DD` | Analysis date — prevents lookahead bias by constraining data up to this date |
| `--analysts` | Comma-separated analyst agents (e.g. `market`, `market,news,sentiment`) |
| `--save` | Persists the full report tree to disk |
| `--html` | Also produces the single-page HTML report |
| `--no-show` | Suppresses the lengthy terminal markdown dump |
| `--gemini-second-opinion` | Adds the optional isolated Gemini critique |
| `--no-checkpoint` | Disables LangGraph checkpoint resume for this run |

## Optional Cloud Secondary Opinion

The local Gemma verdict is always the decision-maker. To attach an additional, independent critique from a frontier cloud model, set `GOOGLE_API_KEY` and pass `--gemini-second-opinion`:

```bash
python -m cli.main --ticker AAPL --date 2024-05-01 --analysts market --gemini-second-opinion
```

This call is fully isolated in `cli/gemini_opinion.py` (unit-tested, fail-open): it critiques the completed local report and can never rewrite or veto the council's decision.

## Python Usage

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

config = DEFAULT_CONFIG.copy()
config["llm_provider"] = "ollama"          # local brain

ta = TradingAgentsGraph(debug=True, config=config)
state, decision = ta.propagate("AAPL", "2024-05-01")
print(decision)

# the report tree the CLI saves, under results_dir/reports
ta.save_reports(state, "AAPL")
```

See `tradingagents/default_config.py` for all configuration options.

## Web Terminal & FastAPI Deployment

The repository ships a web-first delivery path alongside the CLI:

- **Frontend**: Vite + React web terminal under `tradecouncil---institutional-multi-agent-quantitative-terminal/` (dev server: `npm run dev` inside that folder).
- **Backend**: a serverless-ready FastAPI entrypoint at `api/index.py`.
- **Deployment**: `vercel.json` configures multi-service routing (web frontend + Python API), so the terminal can be deployed to Vercel directly.

## Persistence & Memory

- **Persistent decision memory ("Backboard")**: each completed run is logged, and later runs settle previously logged decisions whose holding period has passed by scoring realized return and alpha against the regional benchmark and generating a written reflection that is fed forward.
- **Checkpoint resume**: opt-in with `--checkpoint`; LangGraph saves state after each node so a crashed run resumes from the last successful step rather than restarting.
- **Backtesting**: score decisions over a grid of tickers/dates from the CLI (`tradingagents backtest TICKERS --start ... --end ... --every N`).

## Markets

Any market Yahoo Finance covers, using the exchange-suffixed ticker:

- US: `AAPL`, `SPY` · Hong Kong: `0700.HK` · Tokyo: `7203.T` · London: `AZN.L`
- India: `RELIANCE.NS` · China A-shares: `600519.SS`
- Crypto: `BTC-USD`, `ETH-USD`

## Contributing

Bug fixes, documentation, and feature ideas are welcome. Development changes are documented per-change in [WORKFLOW.md](WORKFLOW.md) and the release notes in [CHANGELOG.md](CHANGELOG.md).

## Attribution

TRADECOUNCIL is developed from Tauric Research's open-source **[TradingAgents](https://github.com/TauricResearch/TradingAgents)** framework. The agent graph, CLI harness, persistence layer, and provider routing are inherited infrastructure; TRADECOUNCIL's contributions center on private local-first operation, the isolated secondary-opinion channel, programmatic report delivery, and the web terminal/API deployment path. See [UPSTREAM_COMPARISON.md](UPSTREAM_COMPARISON.md) for the complete verified baseline vs. delta.

The underlying research is Tauric Research's technical report, *TradingAgents: Multi-Agents LLM Financial Trading Framework* ([arXiv:2412.20138](https://arxiv.org/abs/2412.20138)), by Yijia Xiao, Edward Sun, Di Luo, and Wei Wang.

## Disclaimer

TRADECOUNCIL is designed for **research purposes**. Trading performance varies based on the chosen backbone language models, model temperature, trading periods, data quality, and other non-deterministic factors. The framework is **not** financial, investment, or trading advice, and LLM-driven runs of the same ticker and date can legitimately differ.
