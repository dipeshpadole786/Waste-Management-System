"""
loader.py — Document Loader for Waste Management RAG Pipeline
=============================================================
Responsible for reading documents from disk and converting them
into LangChain Document objects that the rest of the pipeline can use.

Supports: .txt, .pdf, .csv files
"""

import os
import logging
from pathlib import Path
from typing import List

from langchain_core.documents import Document
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    CSVLoader,
    DirectoryLoader,
)

# Configure logging so we can trace what's happening at each step
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("logs/rag_pipeline.log"),
        logging.StreamHandler(),  # also print to console
    ],
)
logger = logging.getLogger(__name__)


def load_documents(data_dir: str = "data") -> List[Document]:
    """
    Load all supported documents from the given directory.

    Args:
        data_dir: Path to the folder containing your knowledge base files.

    Returns:
        A flat list of LangChain Document objects, one per loaded file chunk.

    Raises:
        FileNotFoundError: If the data directory doesn't exist.
    """
    data_path = Path(data_dir)

    if not data_path.exists():
        raise FileNotFoundError(
            f"Data directory '{data_dir}' not found. "
            "Please create it and add your knowledge base documents."
        )

    documents: List[Document] = []

    # ── Load .txt files ────────────────────────────────────────────────────────
    txt_files = list(data_path.glob("*.txt"))
    for txt_file in txt_files:
        try:
            logger.info(f"Loading text file: {txt_file.name}")
            loader = TextLoader(str(txt_file), encoding="utf-8")
            docs = loader.load()
            documents.extend(docs)
            logger.info(f"  [OK] Loaded {len(docs)} document(s) from {txt_file.name}")
        except Exception as e:
            logger.warning(f"  [ERR] Failed to load {txt_file.name}: {e}")

    # ── Load .pdf files ────────────────────────────────────────────────────────
    pdf_files = list(data_path.glob("*.pdf"))
    for pdf_file in pdf_files:
        try:
            logger.info(f"Loading PDF file: {pdf_file.name}")
            loader = PyPDFLoader(str(pdf_file))
            docs = loader.load()
            documents.extend(docs)
            logger.info(f"  [OK] Loaded {len(docs)} page(s) from {pdf_file.name}")
        except Exception as e:
            logger.warning(f"  [ERR] Failed to load {pdf_file.name}: {e}")

    # ── Load .csv files ────────────────────────────────────────────────────────
    csv_files = list(data_path.glob("*.csv"))
    for csv_file in csv_files:
        try:
            logger.info(f"Loading CSV file: {csv_file.name}")
            # Each row in the CSV becomes its own Document
            loader = CSVLoader(str(csv_file))
            docs = loader.load()
            documents.extend(docs)
            logger.info(f"  [OK] Loaded {len(docs)} row(s) from {csv_file.name}")
        except Exception as e:
            logger.warning(f"  [ERR] Failed to load {csv_file.name}: {e}")

    if not documents:
        logger.warning(
            f"No documents found in '{data_dir}'. "
            "Make sure you have .txt, .pdf, or .csv files in that folder."
        )
    else:
        logger.info(f"Total documents loaded: {len(documents)}")

    return documents


# ── Quick test ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    docs = load_documents("data")
    print(f"\nLoaded {len(docs)} document(s).")
    if docs:
        print(f"First 300 characters of first document:\n{docs[0].page_content[:300]}")
