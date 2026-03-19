"""
main.py - WasteBot entrypoint
=============================

Default (recommended for Frontend integration):
  python main.py --server --warmup

Interactive CLI (optional):
  python main.py --cli

Single question (debug):
  python main.py -q "How do I segregate waste at home?"
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("logs/rag_pipeline.log", mode="a", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    logger.warning("python-dotenv not installed; skipping .env loading.")

from pipeline import initialise_pipeline
from rag_chain import query_rag

BANNER = """
============================================================
        WASTE MANAGEMENT RAG CHATBOT (CLI MODE)
  Type 'quit' or 'exit' to stop.
============================================================
"""

EXAMPLE_QUESTIONS = [
    "How do I segregate waste at home?",
    "How can I recycle plastic bottles?",
    "What composting method is best for an apartment?",
    "What should I do if my garbage pickup was missed?",
    "What are the rules for e-waste disposal?",
]


def run_interactive(chain) -> None:
    print(BANNER)
    print("Example questions you can try:")
    for i, q in enumerate(EXAMPLE_QUESTIONS, 1):
        print(f"  {i}. {q}")
    print()

    while True:
        try:
            question = input("Your question: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\nGoodbye! Segregate your waste responsibly.")
            break

        if not question:
            print("  Please type a question.\n")
            continue

        if question.lower() in ("quit", "exit", "q"):
            print("\nGoodbye! Segregate your waste responsibly.")
            break

        result = query_rag(question, chain)
        print("-" * 60)
        print(f"Answer:\n{result['answer']}")
        print("-" * 60)
        print()


def main() -> None:
    parser = argparse.ArgumentParser(description="WasteBot (RAG assistant)")
    parser.add_argument("--cli", action="store_true", help="Run interactive CLI chatbot.")
    parser.add_argument("--server", action="store_true", help="Run HTTP API server (default).")
    parser.add_argument("--host", type=str, default=os.getenv("WASTEBOT_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.getenv("WASTEBOT_PORT", "8001")))
    parser.add_argument("--warmup", action="store_true", help="Warm up pipeline at server startup.")
    parser.add_argument("--rebuild", action="store_true", help="Rebuild vector store (server/cli).")
    parser.add_argument("--data-dir", type=str, default=os.getenv("WASTEBOT_DATA_DIR", "data"))
    parser.add_argument(
        "--question",
        "-q",
        type=str,
        default=None,
        help='Ask a single question and exit. Example: -q "How do I compost?"',
    )
    args = parser.parse_args()

    # One-off debug mode
    if args.question:
        chain = initialise_pipeline(data_dir=args.data_dir, rebuild=args.rebuild)
        result = query_rag(args.question, chain)
        print(result.get("answer", ""))
        return

    # CLI mode (explicit)
    if args.cli:
        chain = initialise_pipeline(data_dir=args.data_dir, rebuild=args.rebuild)
        run_interactive(chain)
        return

    # Server mode (default)
    os.environ.setdefault("WASTEBOT_NO_PROMPT", "1")
    os.environ["WASTEBOT_DATA_DIR"] = args.data_dir
    os.environ["WASTEBOT_REBUILD"] = "1" if args.rebuild else "0"
    os.environ["WASTEBOT_WARMUP"] = "1" if args.warmup else "0"

    import uvicorn

    uvicorn.run("api_server:app", host=args.host, port=args.port, reload=False)


if __name__ == "__main__":
    main()

