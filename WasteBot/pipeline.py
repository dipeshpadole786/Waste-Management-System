"""
pipeline.py - RAG pipeline initialisation
========================================
Shared pipeline builder used by both:
  - CLI (main.py)
  - API server (api_server.py)
"""

from __future__ import annotations

import logging
import os
import sys

from loader import load_documents
from splitter import split_documents, get_chunk_stats
from vectorstore import get_or_build_vectorstore, build_vectorstore, get_retriever
from rag_chain import build_rag_chain

logger = logging.getLogger(__name__)


def initialise_pipeline(data_dir: str = "data", rebuild: bool = False):
    """
    Run the full pipeline setup:
      1. Load documents from data/
      2. Split into chunks
      3. Build (or load) vector store
      4. Create retriever
      5. Build RAG chain

    Args:
        data_dir: Folder containing knowledge base documents.
        rebuild:  If True, delete existing index and re-embed everything.

    Returns:
        A ready-to-use RetrievalQA chain.
    """
    os.makedirs("logs", exist_ok=True)

    logger.info("=" * 60)
    logger.info("  WASTE MANAGEMENT RAG PIPELINE — Starting up")
    logger.info("=" * 60)

    logger.info("\n[Step 1/5] Loading documents...")
    raw_docs = load_documents(data_dir)

    if not raw_docs:
        logger.error(
            f"No documents found in '{data_dir}'. "
            "Add .txt, .pdf, or .csv files and try again."
        )
        sys.exit(1)

    logger.info("\n[Step 2/5] Splitting documents...")
    split_docs = split_documents(raw_docs)

    stats = get_chunk_stats(split_docs)
    total = stats.get("total_chunks", stats.get("count", 0))
    avg = stats.get("avg_chunk_size", stats.get("avg_chars", 0))
    max_len = stats.get("max_chunk_size", stats.get("max_chars", 0))
    min_len = stats.get("min_chunk_size", stats.get("min_chars", 0))
    logger.info(f"  -> Chunks: {total} | Avg size: {avg} chars | Min: {min_len} | Max: {max_len}")

    logger.info("\n[Step 3/5] Building/Loading vector store...")
    if rebuild:
        store = build_vectorstore(split_docs)
    else:
        store = get_or_build_vectorstore(split_docs)

    logger.info("\n[Step 4/5] Creating retriever...")
    retriever = get_retriever(store)

    logger.info("\n[Step 5/5] Building RAG chain...")
    chain = build_rag_chain(retriever)

    logger.info("\n[OK] Pipeline ready!")
    return chain
