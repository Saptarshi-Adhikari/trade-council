# TRADECOUNCIL: Comprehensive System Architecture & Workflow

## 1. Project Overview

**TRADECOUNCIL** is an autonomous multi-agent financial deliberation system. Adapted from Tauric Research's *TradingAgents* framework, TRADECOUNCIL simulates an institutional investment committee. Instead of relying on a single prompt or monolithic LLM, TRADECOUNCIL structures decision-making across specialized adversarial agents:
1. **Analyst Team**: Gathers ground-truth market, fundamental, sentiment, and news data.
2. **Research Team**: Conducts a structured debate between a dedicated **Bull Researcher** and a **Bear Researcher**, moderated by a **Research Manager**.
3. **Trading Team**: A **Trader** synthesizes the research plan into specific trading actions, price targets, and entry/exit levels.
4. **Risk Management Team**: Evaluates the trader's plan through three distinct risk perspectives: **Aggressive**, **Conservative**, and **Neutral**.
5. **Portfolio Management Team**: The **Portfolio Manager** issues the final verdict (**Buy**, **Hold**, **Sell**, **Overweight**, or **Underweight**) along with an executive rationale.

TRADECOUNCIL is configured to run **100% locally and privately** using Google's **Gemma 4** open-weight model on Ollama, with an optional, quota-safe **Gemini 3.5 Flash Lite** secondary critique.

---

## 2. System Architecture & Real Code Execution Path

```
                    ┌───────────────────────────┐
                    │       User CLI Input      │
                    │   (Ticker, Date, Flags)   │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │    Environment Loading    │
                    │  dotenv -> DEFAULT_CONFIG │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │    TradingAgentsGraph     │
                    │  (LangGraph State Machine)│
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
         ▼                                                 ▼
┌─────────────────┐                               ┌─────────────────┐
│ Market Analyst  │ (yfinance technicals)         │ News / Sentiment│ (Optional web/filings)
└────────┬────────┘                               └────────┬────────┘
         │                                                 │
         └────────────────────────┬────────────────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │     Bull vs Bear Debate     │
                   │   Research Team Deliberation│
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │   Research Manager Verdict  │
                   │    Formulates Strategy      │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │    Trader Investment Plan   │
                   │  Sizes & Entry/Exit Levels  │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │   Risk Debate (Agg/Con/Neu) │
                   │  Stress Tests Trade Plan    │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │  Portfolio Manager Decision │
                   │   Final Verdict & Rating    │
                   └──────────────┬──────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
         ▼                                                 ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│  Primary Sovereign Reports    │           │ Optional Gemini Second Opinion│
│  Markdown + HTML Trees Saved  │           │   (gemini-3.5-flash-lite)     │
└───────────────────────────────┘           └───────────────────────────────┘
```

### Key Source Modules & Roles:
- **CLI Entry Point** (`cli/main.py:analyze`): Parses CLI arguments (`--ticker`, `--date`, `--analysts`, `--save`, `--html`, `--gemini-second-opinion`).
- **Configuration Engine** (`tradingagents/default_config.py`): Coerces environment variables (`TRADINGAGENTS_*`) into default settings.
- **Client Factory** (`tradingagents/llm_clients/factory.py`): Instantiates LLM wrappers (`OpenAIClient`, `GoogleClient`, `AnthropicClient`). For Ollama, uses `OpenAIClient(provider="ollama")`.
- **Graph State Machine** (`tradingagents/graph/trading_graph.py`): Compiles the LangGraph state machine and coordinates node execution and SQLite checkpointing.
- **Reporting Engine** (`tradingagents/reporting.py`): Generates consolidated reports (`complete_report.md`, `complete_report.html`) and individual agent markdown files.
- **Secondary Opinion Helper** (`cli/gemini_opinion.py`): Isolated secondary opinion caller for Gemini.

---

## 3. Complete Model Inventory

| Model ID | Provider | Local / Cloud | Intended Role | Actual Configured Role | Verified Usage | API Key / Quota | Status |
|---|---|---|---|---|---|---|---|
| **`gemma4:e2b`** | Ollama | **Local** | Primary open-weight decision engine | Quick & Deep think tiers | **Verified end-to-end** on AAPL (May 1, 2024) | None (Local VRAM) | **Active Default** |
| **`qwen2.5:7b`** | Ollama | **Local** | Working baseline & recovery model | Available fallback model | **Verified end-to-end** on AAPL (May 1, 2024) | None (Local VRAM) | **Installed / Recovery** |
| **`gemini-3.5-flash-lite`**| Google AI | **Cloud** | Quota-safe secondary opinion | Optional second opinion (`--gemini-second-opinion`) | Unit-tested & fail-open verified | Optional `GOOGLE_API_KEY` | **Configured / Optional** |
| `gemini-3.8-flash` | Google AI | Cloud | Alternative deep think model | Catalog option | Not actively routed | `GOOGLE_API_KEY` | Catalogue entry |
| `gpt-6-sol` / `luna` | OpenAI | Cloud | Upstream default models | None (overridden by Ollama) | Unused | `OPENAI_API_KEY` | Inactive |
| `claude-opus-4` | Anthropic | Cloud | Upstream catalog option | None | Unused | `ANTHROPIC_API_KEY` | Inactive |

### Resource Compatibility Note:
- `gemma4:e2b` uses **4.6 GB** on disk and occupies **~4.08 GB VRAM** in Ollama. It executes comfortably inside the host's 6 GB NVIDIA RTX 4050 GPU, yielding ~28 seconds wall-time per analyst stage.

---

## 4. Actual Provider & Agent Routing

TRADECOUNCIL utilizes a two-tier configuration:
1. **Quick-Thinking Tier (`quick_think_llm`)**: Powers Analyst nodes, Bull/Bear debate, and the Trader.
2. **Deep-Thinking Tier (`deep_think_llm`)**: Powers Research Manager, Risk Analysts, and the Portfolio Manager.

In the current TRADECOUNCIL configuration:
- `TRADINGAGENTS_LLM_PROVIDER=ollama`
- `TRADINGAGENTS_QUICK_THINK_LLM=gemma4:e2b`
- `TRADINGAGENTS_DEEP_THINK_LLM=gemma4:e2b`
- `OLLAMA_BASE_URL=http://localhost:11434/v1`

Both tiers route to local Ollama using `gemma4:e2b`.

| Agent Node | Active Model | Function | Direct LLM Call? |
|---|---|---|---|
| **Market Analyst** | `gemma4:e2b` | Evaluates technical indicators and price structure | Yes (Tool calling + narrative generation) |
| **Social / Sentiment Analyst** | `gemma4:e2b` | Assesses retail and social media sentiment | Yes (when selected) |
| **News Analyst** | `gemma4:e2b` | Reviews macroeconomic headlines and filings | Yes (when selected) |
| **Fundamentals Analyst** | `gemma4:e2b` | Analyzes P/E, balance sheet, and revenue trends | Yes (when selected) |
| **Bull Researcher** | `gemma4:e2b` | Develops aggressive upside thesis | Yes |
| **Bear Researcher** | `gemma4:e2b` | Stress-tests downside and risks | Yes |
| **Research Manager** | `gemma4:e2b` | Reconciles debate into an investment plan | Yes |
| **Trader** | `gemma4:e2b` | Sets entry, exit, stop-loss, and sizing | Yes |
| **Risk Analysts (Agg/Con/Neu)** | `gemma4:e2b` | Debates risk scenarios across perspectives | Yes |
| **Portfolio Manager** | `gemma4:e2b` | Issues final verdict (`Buy`, `Hold`, `Sell`, etc.) | Yes |
| **Secondary Opinion (Optional)** | `gemini-3.5-flash-lite` | Independent critique of completed Gemma verdict | Yes (at most 1 call if flagged) |

---

## 5. End-to-End Execution Guide

### Verified CLI Command
To run a clean analysis on Windows without console encoding issues or interactive prompt blocking:

```powershell
$env:PYTHONIOENCODING="utf-8"
$env:PYTHONLEGACYWINDOWSSTDIO="0"
python -m cli.main --ticker AAPL --date 2024-05-01 --analysts market --save --no-show --html --no-checkpoint
```

### Argument Reference:
- `--ticker AAPL`: Asset symbol to analyze (skips prompt).
- `--date 2024-05-01`: Analysis date in `YYYY-MM-DD` format (prevents lookahead bias by constraining historical data up to this date).
- `--analysts market`: Comma-separated list of analyst agents (e.g. `market`, `market,news,sentiment`).
- `--save`: Automatically persists the report tree to disk.
- `--no-show`: Suppresses printing the lengthy terminal markdown dump at the conclusion.
- `--html`: Generates a standalone, styled `complete_report.html`.
- `--no-checkpoint`: Bypasses resumption from previous SQLite checkpoints.
- `--gemini-second-opinion`: *(Optional)* Requests an isolated secondary opinion from Gemini.

---

## 6. Data Providers and Tools

| Provider / Source | Data Supplied | Utilizing Agent | Credentials Required | Verified In Local Runs? | Fallback Behavior When Down |
|---|---|---|---|---|---|
| **Yahoo Finance (`yfinance`)** | Historical OHLCV, moving averages, Bollinger Bands, MACD, ATR | Market Analyst, Trader | **None** | **Yes** (Loaded 22 bars for AAPL) | Fatal if core price data fails; indicators gracefully skip |
| **SEC EDGAR** | 10-K, 10-Q corporate point-in-time filings | Fundamentals Analyst | Optional user agent | Upstream supported | Skips filing lookup if rate limited |
| **FRED** | Federal Reserve macro data (interest rates, CPI) | News/Macro Analyst | Optional `FRED_API_KEY` | Upstream supported | Skips macro series if key is omitted |
| **Polymarket** | Prediction market sentiment probabilities | Sentiment Analyst | **None** (public scraper) | Upstream supported | Skips prediction markets if down |
| **StockTwits / Reddit** | Social post volume & retail sentiment | Sentiment Analyst | Optional `TYPESAFE_API_KEY` | Upstream supported | Skips social sentiment if unavailable |

*Note: In the historical BTC-USD run, FRED and StockTwits were unavailable due to missing optional keys, yet the pipeline completed successfully because all market-data dependencies fail open.*

---

## 7. Configuration Reference (.env)

The application reads configuration from `.env` in the project root. The file is strictly ignored by Git (`.gitignore:151`).

### Recommended Local Ollama Configuration:
```env
# Local Ollama endpoint
OLLAMA_BASE_URL=http://localhost:11434/v1

# Primary Provider and Models
TRADINGAGENTS_LLM_PROVIDER=ollama
TRADINGAGENTS_QUICK_THINK_LLM=gemma4:e2b
TRADINGAGENTS_DEEP_THINK_LLM=gemma4:e2b

# Unattended Execution Configuration
TRADINGAGENTS_OUTPUT_LANGUAGE=English
TRADINGAGENTS_MAX_DEBATE_ROUNDS=1
TRADINGAGENTS_MAX_RISK_ROUNDS=1

# Cloud Keys (Leave EMPTY for 100% local operation)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

---

## 8. CLI Workflow and Report Structure

When an analysis completes with `--save`, reports are stored in:
`~/.tradingagents/logs/reports/<TICKER>_<YYYYMMDD_HHMMSS>/`

### Generated Artifact Structure:
```
├── complete_report.html       # Self-contained visual HTML report
├── complete_report.md         # Consolidated markdown report
├── 1_analysts/
│   └── market.md              # Technical indicators & snapshot analysis
├── 2_research/
│   ├── bull.md                # Bullish arguments
│   ├── bear.md                # Bearish arguments
│   └── manager.md             # Reconciled research plan
├── 3_trading/
│   └── trader.md              # Position sizing and entry/stop levels
├── 4_risk/
│   ├── aggressive.md          # Aggressive upside perspective
│   ├── conservative.md        # Capital preservation perspective
│   └── neutral.md             # Balanced synthesis
└── 5_portfolio/
    ├── decision.md            # Final verdict and rating
    └── gemini_second_opinion.md # (If --gemini-second-opinion was used)
```

---

## 9. Errors & Recovery Playbook

1. **Ollama Not Running (`ConnectionRefusedError`)**:
   - *Symptom*: CLI fails with connection error to port 11434.
   - *Remedy*: Run `ollama serve` in a background terminal.
2. **Windows Unicode Encoding Error (`charmap codec can't encode \u2192`)**:
   - *Symptom*: CLI crashes when printing decorative arrows.
   - *Remedy*: Set `$env:PYTHONIOENCODING="utf-8"` and `$env:PYTHONLEGACYWINDOWSSTDIO="0"`.
3. **Structured Output Failure on Local Models**:
   - *Symptom*: Model returns unstructured text instead of a JSON schema.
   - *Remedy*: Handled automatically. The framework detects empty structured output and retries once as free-text parsing.
4. **Gemini HTTP 429 Quota Exhaustion**:
   - *Symptom*: Secondary opinion fails on free Gemini tier limits.
   - *Remedy*: Handled automatically. `cli/gemini_opinion.py` catches 429 and resource exhausted exceptions, prints a yellow warning, and continues with the local Gemma verdict.
5. **Switching to Recovery Model**:
   - *Symptom*: Need to revert to baseline Qwen.
   - *Remedy*: In `.env`, change model tags back:
     ```env
     TRADINGAGENTS_QUICK_THINK_LLM=qwen2.5:7b
     TRADINGAGENTS_DEEP_THINK_LLM=qwen2.5:7b
     ```

---

## 10. Feature Status Matrix

| Feature | Status | Notes |
|---|---|---|
| **Local Ollama Inference** | **Implemented & Verified** | Default brain running `gemma4:e2b`. |
| **Qwen 2.5 7B Baseline** | **Implemented & Verified** | Installed and tested as recovery option. |
| **Optional Gemini Second Opinion** | **Implemented & Verified** | Isolated, quota-safe module in `cli/gemini_opinion.py`. |
| **HTML & Markdown Reporting** | **Implemented & Verified** | Full report trees generated under `~/.tradingagents/logs/`. |
| **Persistent Decision Journal** | **Planned** | MongoDB Atlas / SQLite persistence for historical verdicts. |
| **Interactive Web UI** | **Planned** | Sleek front-end dashboard to observe live deliberations. |
| **Voice Synthesis (ElevenLabs)** | **Planned** | Audio briefing of final council decisions. |
| **Cloud Deployment (DigitalOcean)**| **Planned** | Containerized deployment on DigitalOcean Droplet. |

---

## 11. Safety, Attribution and Disclaimers

> [!WARNING]
> **Research and Educational Use Only**: TRADECOUNCIL is a multi-agent simulation framework designed for research and algorithmic experimentation. It does **not** provide financial advice. Market data may be delayed, incomplete, or subject to API rate limits. LLM outputs may hallucinate facts or rationale. Never risk real capital solely on automated model recommendations.

### Upstream Attribution:
TRADECOUNCIL is derived from [TradingAgents](https://github.com/TauricResearch/TradingAgents.git), authored by Tauric Research under the Apache License 2.0. If citing this architecture, please cite the original research paper:

```bibtex
@article{tradingagents2024,
  title={TradingAgents: Multi-Agents LLM Financial Trading Framework},
  author={Tauric Research},
  journal={arXiv preprint},
  year={2024}
}
```
