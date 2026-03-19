"""
rag_chain.py - RAG Chain (FAISS retriever + prompt + Groq LLM)
=============================================================
This project is configured to use Groq only.

Required env vars (put them in `.env` and python-dotenv will load them):
  - GROQ_API_KEY
Optional:
  - GROQ_MODEL (if omitted, auto-selected)
"""

from __future__ import annotations

import getpass
import logging
import os
import sys
from dataclasses import dataclass
from typing import Any, Optional

from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate
from langchain_core.retrievers import BaseRetriever

logger = logging.getLogger(__name__)

GROQ_MODEL = (os.getenv("GROQ_MODEL") or "").strip()
GROQ_API_BASE = os.getenv("GROQ_API_BASE", "https://api.groq.com").rstrip("/")
DEFAULT_MODEL_FALLBACKS = [
    # Used only if model listing fails; keep this small and generic.
    "llama-3.1-8b-instant",
    "llama-3.1-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
]

PROMPT_TEMPLATE = """
You are a knowledgeable Waste Management Assistant helping citizens manage waste responsibly.

Use ONLY the information provided in the context below to answer the question.
If the context does not contain enough information, say:
"I don't have specific information about that in my knowledge base. Please contact your local municipal corporation."

Do NOT make up facts. Keep your answer clear, concise, and actionable.

Context:
---------
{context}
---------

Question: {question}

Answer:
"""

PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template=PROMPT_TEMPLATE,
)


def _list_groq_models(api_key: str) -> list[str]:
    """
    List available model ids from Groq's OpenAI-compatible endpoint.

    This avoids hardcoding a model that later gets deprecated/decommissioned.
    """
    try:
        import httpx  # type: ignore
    except Exception:
        return []

    url = f"{GROQ_API_BASE}/openai/v1/models"
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(url, headers={"Authorization": f"Bearer {api_key}"})
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []

    ids: list[str] = []
    for row in (data or {}).get("data", []) if isinstance(data, dict) else []:
        mid = row.get("id") if isinstance(row, dict) else None
        if isinstance(mid, str) and mid.strip():
            ids.append(mid.strip())
    return ids


def _pick_best_model(model_ids: list[str]) -> Optional[str]:
    if not model_ids:
        return None

    def score(mid: str) -> tuple[int, int]:
        m = mid.lower()
        s = 0
        # Prefer newer llama families and general chat models
        if "llama" in m:
            s += 50
        if "3.1" in m or "3-1" in m or "3_1" in m:
            s += 20
        if "instruct" in m or "it" in m:
            s += 10
        # Prefer smaller/faster by default for CLI
        if "8b" in m:
            s += 6
        if "70b" in m:
            s -= 3
        if "deprecated" in m or "decommission" in m:
            s -= 100
        # longer context can help RAG answers
        if "32768" in m or "32k" in m:
            s += 2
        return (s, -len(mid))

    return max(model_ids, key=score)


def _is_model_decommissioned_error(err: Exception) -> bool:
    msg = str(err).lower()
    return ("model" in msg and "decommission" in msg) or ("code" in msg and "model_decommissioned" in msg)


def load_llm(model: Optional[str] = None) -> BaseLanguageModel:
    """Load Groq LLM via `langchain-groq`. Requires `GROQ_API_KEY`."""
    try:
        from langchain_groq import ChatGroq
    except ImportError as e:
        raise ImportError("Run:  pip install langchain-groq groq") from e

    api_key = (os.getenv("GROQ_API_KEY") or "").strip()

    no_prompt = (os.getenv("WASTEBOT_NO_PROMPT") or "").strip().lower() in ("1", "true", "yes", "y")
    if not api_key and not no_prompt and sys.stdin.isatty():
        try:
            api_key = getpass.getpass("Enter GROQ_API_KEY (input hidden): ").strip()
        except (EOFError, OSError):
            api_key = ""

    if not api_key:
        raise EnvironmentError(
            "GROQ_API_KEY environment variable not set. "
            "Set it in WasteBot/.env, or export it in your shell. "
            "For non-interactive runs, set WASTEBOT_NO_PROMPT=1 to disable prompting."
        )

    chosen_model = (model or "").strip() or GROQ_MODEL
    if not chosen_model:
        model_ids = _list_groq_models(api_key)
        chosen_model = _pick_best_model(model_ids) or ""
    if not chosen_model:
        chosen_model = DEFAULT_MODEL_FALLBACKS[0]

    base_kwargs = {"temperature": 0.2, "max_tokens": 512}

    last_err: Optional[Exception] = None
    for api_key_arg in ("groq_api_key", "api_key"):
        for model_arg in ("model", "model_name"):
            try:
                llm = ChatGroq(**base_kwargs, **{api_key_arg: api_key, model_arg: chosen_model})
                logger.info(f"LLM: Groq loaded (model={chosen_model}).")
                return llm
            except TypeError as e:
                last_err = e

    raise TypeError(
        "Unsupported ChatGroq constructor signature for this version of langchain-groq. "
        "Try upgrading `langchain-groq`."
    ) from last_err


@dataclass
class SimpleRetrievalQA:
    """
    Minimal RetrievalQA-like wrapper for LangChain v1+.

    Expects `chain.invoke({\"query\": ...})` to return:
      {\"result\": \"...\", \"source_documents\": [...]}
    """

    retriever: BaseRetriever
    llm: BaseLanguageModel
    prompt: PromptTemplate

    def invoke(self, inputs: dict[str, Any]) -> dict[str, Any]:
        query = (inputs.get("query") or inputs.get("question") or "").strip()
        if not query:
            return {"result": "", "source_documents": []}

        try:
            source_documents = self.retriever.invoke(query)
        except Exception:
            source_documents = self.retriever.get_relevant_documents(query)

        context = "\n\n".join(d.page_content for d in source_documents)
        prompt_text = self.prompt.format(context=context, question=query)

        llm_out = self.llm.invoke(prompt_text)
        answer = getattr(llm_out, "content", None)
        if answer is None:
            answer = str(llm_out)

        return {"result": answer, "source_documents": source_documents}


def build_rag_chain(retriever: BaseRetriever) -> SimpleRetrievalQA:
    llm = load_llm()
    chain = SimpleRetrievalQA(retriever=retriever, llm=llm, prompt=PROMPT)
    logger.info("RAG chain assembled successfully.")
    return chain


def query_rag(question: str, chain: SimpleRetrievalQA) -> dict:
    if not question or not question.strip():
        logger.warning("Empty query received - returning default response.")
        return {
            "answer": "Please enter a valid question about waste management.",
            "sources": [],
        }

    question = question.strip()

    waste_keywords = [
        "waste",
        "garbage",
        "trash",
        "recycl",
        "compost",
        "segregat",
        "bin",
        "pickup",
        "litter",
        "plastic",
        "hazardous",
        "e-waste",
        "biodegradable",
        "landfill",
        "municipal",
        "solid",
        "dispose",
        "collection",
        "organic",
        "sanitary",
        "zero waste",
    ]
    if not any(kw in question.lower() for kw in waste_keywords):
        logger.info(f"Off-topic query detected: '{question}'")
        return {
            "answer": (
                "I'm a Waste Management Assistant and can only answer questions "
                "about waste segregation, recycling, composting, disposal, "
                "or municipal waste rules. Please ask a waste-related question."
            ),
            "sources": [],
        }

    logger.info(f"Processing query: '{question}'")

    try:
        response = chain.invoke({"query": question})
        answer = response.get("result", "No answer generated.")
        sources = response.get("source_documents", [])
        logger.info(f"  [OK] Answer generated. Sources retrieved: {len(sources)}")
        return {"answer": answer, "sources": sources}
    except Exception as e:
        if _is_model_decommissioned_error(e):
            logger.warning(
                "Groq model appears decommissioned; auto-selecting a supported model. "
                "Set GROQ_MODEL in .env to pin a specific model."
            )
            try:
                # Try to discover a supported model and retry once.
                api_key = (os.getenv("GROQ_API_KEY") or "").strip()
                model_ids = _list_groq_models(api_key) if api_key else []
                chosen = _pick_best_model(model_ids) or (DEFAULT_MODEL_FALLBACKS[0] if DEFAULT_MODEL_FALLBACKS else "")
                if chosen:
                    chain.llm = load_llm(model=chosen)
                    response = chain.invoke({"query": question})
                    answer = response.get("result", "No answer generated.")
                    sources = response.get("source_documents", [])
                    logger.info(f"  [OK] Answer generated after model switch. Sources retrieved: {len(sources)}")
                    return {"answer": answer, "sources": sources}
            except Exception as retry_err:
                logger.error(f"Retry after model switch failed: {retry_err}", exc_info=True)

        logger.error(f"Error during RAG chain execution: {e}", exc_info=True)
        return {
            "answer": (
                "An error occurred while processing your question. "
                "If this is a model error, set a supported `GROQ_MODEL` in `.env` and retry."
            ),
            "sources": [],
        }
