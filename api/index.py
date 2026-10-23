"""Vercel Python serverless entrypoint for the TRADECOUNCIL FastAPI backend.

Vercel's Python runtime discovers this file via the api/ directory convention.
The FastAPI `app` object from cli/server.py is imported here and served as
the ASGI handler for all /api/* routes.
"""
import sys
import os

# Ensure the repo root is on the path so `tradingagents` and `cli` packages
# resolve correctly when running as a Vercel serverless function.
_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

# Load .env from repo root (no-op when env vars are already set by Vercel).
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_REPO_ROOT, ".env"), override=False)
except Exception:
    pass

# Re-export the FastAPI app — Vercel's @vercel/python runtime picks it up.
from cli.server import app  # noqa: F401, E402
