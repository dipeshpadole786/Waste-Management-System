"""
splitter.py — Text Splitter for Waste Management RAG Pipeline
=============================================================
Breaks large documents into smaller, overlapping chunks so that
the embedding model and LLM can process them efficiently.

Why chunking matters:
  • Embedding models have a token limit (~512 tokens for MiniLM).
  • Smaller chunks = more precise retrieval matches.
  • Overlap preserves context across chunk boundaries.
"""

import logging
from typing import List

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)


# ── Tuned for waste-management domain text ─────────────────────────────────────
CHUNK_SIZE = 500        # characters per chunk (≈ 100–130 tokens, well within MiniLM limit)
CHUNK_OVERLAP = 100     # overlap keeps context intact across boundaries
SEPARATORS = [          # try splitting on these characters, in order of preference
    "\n\n",             # paragraph breaks first
    "\n",               # then line breaks
    ". ",               # then sentence ends
    " ",                # then individual words
    "",                 # last resort: character-level split
]


def split_documents(
    documents: List[Document],
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> List[Document]:
    """
    Split a list of LangChain Documents into smaller overlapping chunks.

    Args:
        documents:     Raw documents from the loader.
        chunk_size:    Maximum number of characters per chunk.
        chunk_overlap: Number of characters to share between adjacent chunks.

    Returns:
        A (larger) list of smaller Document chunks, each with source metadata
        inherited from the original document.
    """
    if not documents:
        logger.warning("split_documents received an empty document list.")
        return []

    logger.info(
        f"Splitting {len(documents)} document(s) -> "
        f"chunk_size={chunk_size}, overlap={chunk_overlap}"
    )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=SEPARATORS,
        length_function=len,          # measure length in characters
        add_start_index=True,         # store char offset in metadata for debugging
    )

    chunks: List[Document] = splitter.split_documents(documents)

    # ── Sanity-check: remove empty chunks ─────────────────────────────────────
    chunks = [c for c in chunks if c.page_content.strip()]

    logger.info(f"  [OK] Produced {len(chunks)} chunk(s) after splitting.")

    # Log a sample so you can verify quality during development
    if chunks:
        sample = chunks[0].page_content[:200].replace("\n", " ")
        logger.debug(f"  Sample chunk[0]: '{sample}...'")

    return chunks


def get_chunk_stats(chunks: List[Document]) -> dict:
    """
    Return basic statistics about the chunk lengths (for debugging / tuning).

    Args:
        chunks: List of document chunks.

    Returns:
        dict with min, max, and average character counts.
    """
    if not chunks:
        return {"count": 0, "min": 0, "max": 0, "avg": 0}

    lengths = [len(c.page_content) for c in chunks]
    stats = {
        "count": len(chunks),
        "min_chars": min(lengths),
        "max_chars": max(lengths),
        "avg_chars": round(sum(lengths) / len(lengths), 1),
    }
    logger.info(f"Chunk stats: {stats}")
    return stats


# ── Quick test ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    from loader import load_documents

    raw_docs = load_documents("data")
    chunks = split_documents(raw_docs)
    stats = get_chunk_stats(chunks)

    print(f"\nChunk statistics: {stats}")
    print(f"\nSample chunk:\n{chunks[0].page_content if chunks else 'No chunks generated'}")
