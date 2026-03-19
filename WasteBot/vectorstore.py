"""
vectorstore.py - Vector store (FAISS optional, local fallback)
=============================================================
On Windows, `faiss-cpu` is often not available via `pip`, which can break
LangChain's FAISS vector store.

This module therefore:
  - Uses FAISS when available, OR
  - Falls back to a simple local cosine-similarity store (JSON-persisted)

Both stores expose:
  - similarity_search(query, k)
  - as_retriever(search_kwargs={"k": ...})
  - save_local(folder_path)
"""

from __future__ import annotations

import json
import logging
import math
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings

from embeddings import get_embedding_config, get_embedding_model

logger = logging.getLogger(__name__)

VECTOR_STORE_DIR = "vector_store"
VECTOR_STORE_NAME = "waste_faiss"  # keep folder name stable for existing users
TOP_K = 4

EMBEDDING_CONFIG_FILENAME = "embedding_config.json"
LOCAL_STORE_FILENAME = "local_store.json"


def _try_import_faiss_store():
    try:
        from langchain_community.vectorstores import FAISS  # type: ignore

        return FAISS
    except Exception:
        return None


def _json_safe_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    safe: dict[str, Any] = {}
    for k, v in (metadata or {}).items():
        if v is None or isinstance(v, (str, int, float, bool)):
            safe[k] = v
        else:
            safe[k] = str(v)
    return safe


def _write_embedding_config(save_path: str, vectorstore_backend: str) -> None:
    try:
        cfg = dict(get_embedding_config())
        cfg["vectorstore"] = vectorstore_backend
        (Path(save_path) / EMBEDDING_CONFIG_FILENAME).write_text(
            json.dumps(cfg, indent=2),
            encoding="utf-8",
        )
    except Exception as e:
        logger.warning(f"Failed to write embedding config next to vector store: {e}")


def _read_saved_embedding_config(save_path: str) -> Optional[dict[str, Any]]:
    cfg_path = Path(save_path) / EMBEDDING_CONFIG_FILENAME
    if not cfg_path.exists():
        return None
    try:
        data = json.loads(cfg_path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
        return None
    except Exception:
        return None


@dataclass
class LocalVectorStore:
    documents: list[Document]
    vectors: list[list[float]]
    norms: list[float]
    embeddings: Embeddings

    @classmethod
    def from_documents(cls, documents: list[Document], embedding: Embeddings) -> "LocalVectorStore":
        texts = [d.page_content for d in documents]
        vectors = embedding.embed_documents(texts)
        norms: list[float] = []
        for vec in vectors:
            n = math.sqrt(sum(v * v for v in vec))
            norms.append(n if n > 0 else 1.0)
        return cls(documents=list(documents), vectors=vectors, norms=norms, embeddings=embedding)

    def similarity_search(self, query: str, k: int = TOP_K) -> list[Document]:
        if not self.documents:
            return []
        q_vec = self.embeddings.embed_query(query)
        q_norm = math.sqrt(sum(v * v for v in q_vec)) or 1.0

        scored: list[tuple[float, int]] = []
        for i, vec in enumerate(self.vectors):
            dot = 0.0
            # assume mostly-equal dims; handle mismatch defensively
            for a, b in zip(q_vec, vec):
                dot += a * b
            sim = dot / (q_norm * self.norms[i])
            scored.append((sim, i))

        scored.sort(key=lambda t: t[0], reverse=True)
        idxs = [i for _, i in scored[: max(1, int(k))]]
        return [self.documents[i] for i in idxs]

    def as_retriever(self, search_kwargs: Optional[dict[str, Any]] = None, **_: Any):
        k = TOP_K
        if search_kwargs and isinstance(search_kwargs.get("k"), int):
            k = int(search_kwargs["k"])
        return LocalRetriever(store=self, k=k)

    def save_local(self, folder_path: str) -> None:
        Path(folder_path).mkdir(parents=True, exist_ok=True)
        payload: list[dict[str, Any]] = []
        for doc, vec, norm in zip(self.documents, self.vectors, self.norms):
            payload.append(
                {
                    "page_content": doc.page_content,
                    "metadata": _json_safe_metadata(dict(doc.metadata or {})),
                    "vector": vec,
                    "norm": norm,
                }
            )
        (Path(folder_path) / LOCAL_STORE_FILENAME).write_text(
            json.dumps(payload),
            encoding="utf-8",
        )

    @classmethod
    def load_local(cls, folder_path: str, embeddings: Embeddings) -> "LocalVectorStore":
        p = Path(folder_path) / LOCAL_STORE_FILENAME
        data = json.loads(p.read_text(encoding="utf-8"))
        documents: list[Document] = []
        vectors: list[list[float]] = []
        norms: list[float] = []

        for row in data:
            documents.append(Document(page_content=row["page_content"], metadata=row.get("metadata") or {}))
            vectors.append(row["vector"])
            norms.append(float(row.get("norm") or 1.0))

        return cls(documents=documents, vectors=vectors, norms=norms, embeddings=embeddings)


@dataclass(frozen=True)
class LocalRetriever:
    store: LocalVectorStore
    k: int = TOP_K

    def invoke(self, query: str) -> list[Document]:
        return self.store.similarity_search(query, k=self.k)

    def get_relevant_documents(self, query: str) -> list[Document]:
        return self.store.similarity_search(query, k=self.k)


def build_vectorstore(chunks: list[Document]):
    if not chunks:
        raise ValueError(
            "Cannot build a vector store from an empty chunk list. "
            "Check that your documents loaded and split correctly."
        )

    embedding_model = get_embedding_model()
    save_path = os.path.join(VECTOR_STORE_DIR, VECTOR_STORE_NAME)

    faiss_store = _try_import_faiss_store()
    if faiss_store is not None:
        try:
            logger.info(f"Building FAISS index from {len(chunks)} chunks...")
            vectorstore = faiss_store.from_documents(documents=chunks, embedding=embedding_model)
            os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
            vectorstore.save_local(save_path)
            _write_embedding_config(save_path, vectorstore_backend="faiss")
            logger.info(f"  [OK] Vector store saved -> {save_path}/")
            return vectorstore
        except Exception as e:
            logger.warning(f"FAISS build failed ({e}); falling back to local vector store.")

    logger.info(f"Building local vector store from {len(chunks)} chunks...")
    vectorstore = LocalVectorStore.from_documents(chunks, embedding_model)
    os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
    vectorstore.save_local(save_path)
    _write_embedding_config(save_path, vectorstore_backend="local")
    logger.info(f"  [OK] Local vector store saved -> {save_path}/")
    return vectorstore


def load_vectorstore():
    save_path = os.path.join(VECTOR_STORE_DIR, VECTOR_STORE_NAME)
    if not Path(save_path).exists():
        logger.info("No existing vector store found on disk.")
        return None

    saved_cfg = _read_saved_embedding_config(save_path) or {}
    current_cfg = get_embedding_config()
    if saved_cfg.get("backend") and saved_cfg.get("backend") != current_cfg.get("backend"):
        logger.warning(
            "Vector store was built with a different embedding backend; rebuilding is required.\n"
            f"  saved:   {saved_cfg}\n"
            f"  current: {current_cfg}"
        )
        return None

    vectorstore_backend = saved_cfg.get("vectorstore")

    # Prefer loading whichever backend was used.
    embedding_model = get_embedding_model()

    if vectorstore_backend == "faiss" or (Path(save_path) / "index.faiss").exists():
        faiss_store = _try_import_faiss_store()
        if faiss_store is not None and (Path(save_path) / "index.faiss").exists():
            logger.info(f"Loading FAISS vector store from: {save_path}/")
            vectorstore = faiss_store.load_local(
                folder_path=save_path,
                embeddings=embedding_model,
                allow_dangerous_deserialization=True,
            )
            logger.info("  [OK] Vector store loaded from disk.")
            return vectorstore
        # Can't load FAISS here (faiss missing) -> fall through to local if present.

    local_file = Path(save_path) / LOCAL_STORE_FILENAME
    if local_file.exists():
        logger.info(f"Loading local vector store from: {save_path}/")
        vectorstore = LocalVectorStore.load_local(save_path, embeddings=embedding_model)
        logger.info("  [OK] Local vector store loaded from disk.")
        return vectorstore

    logger.info("No compatible vector store found on disk.")
    return None


def get_or_build_vectorstore(chunks: list[Document]):
    vectorstore = load_vectorstore()
    if vectorstore is None:
        logger.info("Building new vector store (this only happens once)...")
        vectorstore = build_vectorstore(chunks)
    else:
        logger.info("Using cached vector store (skipping re-embedding).")
    return vectorstore


def get_retriever(vectorstore: Any, top_k: int = TOP_K):
    if hasattr(vectorstore, "as_retriever"):
        try:
            retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": top_k})
            logger.info(f"Retriever configured: top_k={top_k}")
            return retriever
        except TypeError:
            retriever = vectorstore.as_retriever(search_kwargs={"k": top_k})
            logger.info(f"Retriever configured: top_k={top_k}")
            return retriever

    # Very defensive fallback
    if isinstance(vectorstore, LocalVectorStore):
        return LocalRetriever(store=vectorstore, k=top_k)
    raise TypeError("Vector store does not support retriever interface.")


def search_similar(query: str, vectorstore: Any, top_k: int = TOP_K) -> list[Document]:
    logger.info(f"Searching for top-{top_k} chunks similar to: '{query}'")
    results = vectorstore.similarity_search(query, k=top_k)
    logger.info(f"  [OK] Retrieved {len(results)} chunk(s).")
    return results


if __name__ == "__main__":
    from loader import load_documents
    from splitter import split_documents

    raw_docs = load_documents("data")
    chunks = split_documents(raw_docs)
    vs = get_or_build_vectorstore(chunks)
    results = search_similar("How do I compost kitchen waste?", vs, top_k=4)
    print(f"Retrieved {len(results)} docs")

