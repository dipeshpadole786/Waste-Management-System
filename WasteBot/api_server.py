"""
WasteBot API Server
===================
Thin FastAPI wrapper around the existing RAG pipeline (main.py).

Run:
  python api_server.py --port 8001

Env:
  GROQ_API_KEY=...
  (optional) GROQ_MODEL=...
"""

from __future__ import annotations

import argparse
import logging
import os
import threading
from typing import Any

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from pipeline import initialise_pipeline
from rag_chain import query_rag

logger = logging.getLogger("wastebot.api")
os.environ.setdefault("WASTEBOT_NO_PROMPT", "1")

app = FastAPI(title="WasteBot API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("WASTEBOT_CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_chain_lock = threading.Lock()
_chain: Any | None = None
_chain_data_dir: str | None = None


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    rebuild: bool = False
    data_dir: str = "data"


class SourceOut(BaseModel):
    source: str
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceOut] = []


def _get_chain(*, data_dir: str, rebuild: bool) -> Any:
    global _chain, _chain_data_dir
    with _chain_lock:
        if rebuild or _chain is None or _chain_data_dir != data_dir:
            logger.info("Initialising pipeline (data_dir=%s, rebuild=%s)", data_dir, rebuild)
            _chain = initialise_pipeline(data_dir=data_dir, rebuild=rebuild)
            _chain_data_dir = data_dir
    return _chain


@app.on_event("startup")
def _startup() -> None:
    warmup = (os.getenv("WASTEBOT_WARMUP") or "").strip().lower() in ("1", "true", "yes", "y")
    rebuild = (os.getenv("WASTEBOT_REBUILD") or "").strip().lower() in ("1", "true", "yes", "y")
    data_dir = (os.getenv("WASTEBOT_DATA_DIR") or "data").strip() or "data"
    if not warmup:
        return
    try:
        _get_chain(data_dir=data_dir, rebuild=rebuild)
    except Exception:
        logger.exception("Startup warmup failed.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    question = (req.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required.")

    try:
        chain = _get_chain(data_dir=req.data_dir, rebuild=req.rebuild)
        result = query_rag(question, chain)
    except Exception as e:
        logger.exception("WasteBot error")
        raise HTTPException(status_code=500, detail=str(e)) from e

    sources_out: list[SourceOut] = []
    for doc in (result.get("sources") or [])[:5]:
        try:
            src = str(getattr(doc, "metadata", {}).get("source", "unknown"))
            text = str(getattr(doc, "page_content", "")).replace("\n", " ").strip()
            snippet = (text[:180] + "...") if len(text) > 180 else text
            sources_out.append(SourceOut(source=os.path.basename(src) or src, snippet=snippet))
        except Exception:
            continue

    return ChatResponse(answer=str(result.get("answer") or ""), sources=sources_out)


def main() -> None:
    parser = argparse.ArgumentParser(description="WasteBot FastAPI server")
    parser.add_argument("--host", type=str, default="127.0.0.1")
    parser.add_argument("--port", type=int, default=int(os.getenv("WASTEBOT_PORT", "8001")))
    parser.add_argument("--warmup", action="store_true", help="Build the RAG pipeline at startup.")
    parser.add_argument("--data-dir", type=str, default=os.getenv("WASTEBOT_DATA_DIR", "data"))
    args = parser.parse_args()

    if args.warmup:
        try:
            _get_chain(data_dir=args.data_dir, rebuild=False)
        except Exception:
            logger.exception("Warmup failed (server will still start).")

    import uvicorn

    uvicorn.run("api_server:app", host=args.host, port=args.port, reload=False)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    main()
