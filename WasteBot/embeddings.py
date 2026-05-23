"""
embeddings.py - Embeddings (HF with offline fallback)
====================================================
This project prefers local HuggingFace sentence-transformer embeddings, but on
some machines the `sentence_transformers` dependency isn't installed, or the
model can't be downloaded the first time (no internet / firewall).

To keep the app usable in those environments, we provide a deterministic,
offline fallback embedding backend based on feature-hashing.

Config:
  - RAG_EMBEDDINGS_BACKEND=hf   (default)  -> use HuggingFaceEmbeddings
  - RAG_EMBEDDINGS_BACKEND=hash            -> use offline hash embeddings
"""

from __future__ import annotations

import hashlib
import logging
import math
import os
import re
from functools import lru_cache
from typing import Any, Optional

from langchain_core.embeddings import Embeddings

logger = logging.getLogger(__name__)

# HuggingFace / sentence-transformers config
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CACHE_FOLDER = "cache"
DEVICE = "cpu"  # switch to "cuda" if you have an NVIDIA GPU

# Backend selection
DEFAULT_EMBEDDINGS_BACKEND = "hf"  # hf | hash
EMBEDDINGS_BACKEND = os.getenv("RAG_EMBEDDINGS_BACKEND", DEFAULT_EMBEDDINGS_BACKEND).strip().lower()

# Offline hash embeddings config
HASH_EMBEDDINGS_DIM = 384
_TOKEN_RE = re.compile(r"[A-Za-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return [t for t in _TOKEN_RE.findall((text or "").lower()) if len(t) >= 2]


class HashEmbeddings(Embeddings):
    """
    Offline embedding fallback (no model downloads, no extra packages).

    Quality is lower than sentence-transformers, but this avoids hard failures
    when `sentence_transformers` isn't installed or HF downloads are blocked.
    """

    def __init__(self, dim: int = HASH_EMBEDDINGS_DIM, normalize: bool = True, salt: str = "wastebot") -> None:
        self.dim = int(dim)
        self.normalize = bool(normalize)
        self._salt = salt.encode("utf-8", errors="ignore")

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_one(t) for t in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed_one(text)

    def _embed_one(self, text: str) -> list[float]:
        vec = [0.0] * self.dim
        tokens = _tokenize(text)
        if not tokens:
            return vec

        for token in tokens:
            digest = hashlib.blake2b(
                token.encode("utf-8", errors="ignore"),
                digest_size=8,
                key=self._salt,
            ).digest()
            h = int.from_bytes(digest, byteorder="little", signed=False)
            idx = h % self.dim
            sign = -1.0 if (h >> 63) & 1 else 1.0
            vec[idx] += sign

        if self.normalize:
            norm = math.sqrt(sum(v * v for v in vec))
            if norm > 0:
                inv = 1.0 / norm
                vec = [v * inv for v in vec]

        return vec


def _try_load_hf_embeddings() -> Optional[Embeddings]:
    try:
        from langchain_huggingface import HuggingFaceEmbeddings  # type: ignore
    except Exception:
        return None

    try:
        return HuggingFaceEmbeddings(
            model_name=MODEL_NAME,
            cache_folder=CACHE_FOLDER,
            model_kwargs={"device": DEVICE},
            encode_kwargs={"normalize_embeddings": True},
        )
    except Exception:
        return None


@lru_cache(maxsize=1)
def get_embedding_model() -> Embeddings:
    os.makedirs(CACHE_FOLDER, exist_ok=True)

    backend = EMBEDDINGS_BACKEND or DEFAULT_EMBEDDINGS_BACKEND
    if backend == "hash":
        logger.info("Embeddings: using offline hash backend (RAG_EMBEDDINGS_BACKEND=hash).")
        return HashEmbeddings()

    if backend not in ("hf", "huggingface"):
        logger.warning(f"Embeddings: unknown RAG_EMBEDDINGS_BACKEND='{backend}', using 'hf'.")

    logger.info(f"Embeddings: loading HuggingFace model: {MODEL_NAME}")
    logger.info(f"  Cache folder : {CACHE_FOLDER}")
    logger.info(f"  Device       : {DEVICE}")

    model = _try_load_hf_embeddings()
    if model is not None:
        logger.info("  [OK] HuggingFace embeddings loaded.")
        return model

    logger.warning(
        "Embeddings: HuggingFace embeddings unavailable (missing `sentence_transformers` or model download blocked). "
        "Falling back to offline hash embeddings.\n"
        "Fix (optional, better retrieval): pip install sentence-transformers"
    )
    return HashEmbeddings()


@lru_cache(maxsize=1)
def get_embedding_config() -> dict[str, Any]:
    model = get_embedding_model()
    if isinstance(model, HashEmbeddings):
        return {"backend": "hash", "dim": model.dim, "normalize": model.normalize}
    return {
        "backend": "hf",
        "model_name": MODEL_NAME,
        "cache_folder": CACHE_FOLDER,
        "device": DEVICE,
        "normalize_embeddings": True,
    }


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    vectors = model.embed_documents(texts)
    if vectors:
        logger.debug(f"Embedded {len(texts)} text(s) -> vector dim = {len(vectors[0])}")
    return vectors


def embed_query(query: str) -> list[float]:
    model = get_embedding_model()
    vector = model.embed_query(query)
    logger.debug(f"Embedded query -> vector dim = {len(vector)}")
    return vector


if __name__ == "__main__":
    model = get_embedding_model()
    cfg = get_embedding_config()
    print(f"Backend: {cfg}")
    test_sentences = [
        "How do I recycle plastic bottles?",
        "What goes in the green bin?",
    ]
    vectors = embed_texts(test_sentences)
    print(f"\nEmbedded {len(vectors)} sentences.")
    if vectors:
        print(f"Vector dimensionality: {len(vectors[0])}")
        print(f"First 8 values of vector[0]: {[round(v, 4) for v in vectors[0][:8]]}")

