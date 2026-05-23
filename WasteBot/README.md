# WasteBot (Groq-only RAG)

WasteBot is a small Retrieval-Augmented Generation (RAG) CLI chatbot for waste-management questions.
It builds a local FAISS index from documents in `data/`, retrieves relevant chunks, and asks a Groq
LLM to answer using only that context.

On Windows, FAISS may not install via `pip`. In that case WasteBot automatically uses a local
JSON-based vector store (slower, but works without `faiss`).

## Setup

### 1) Create a virtual environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
```

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

### 3) Add your Groq key in `.env`

Create `.env` (it is already in `.gitignore`) with:

```env
GROQ_API_KEY="gsk_..."
# Optional: pin a specific Groq model id. If omitted, WasteBot will auto-select
# a supported model from your Groq account.
# GROQ_MODEL="..."

# Embeddings:
# - hf   (default) -> HuggingFace sentence-transformer (best quality)
# - hash -> offline fallback (no downloads)
RAG_EMBEDDINGS_BACKEND=hf
```

## Running

```bash
python main.py --server --warmup
```

## Running as an API (for Frontend integration)

```bash
python api_server.py --port 8001 --warmup
```

Then the Node backend proxies requests:
- `POST http://localhost:3000/wastebot/chat`
- `GET  http://localhost:3000/wastebot/health`

## CLI mode (optional)

```bash
python main.py --cli
```

Single question:

```bash
python main.py -q "How do I segregate waste at home?"
```

Rebuild vector store (after adding documents):

```bash
python main.py --rebuild
```

## Embeddings note (fix for `sentence_transformers` missing)

If `sentence_transformers` is not installed or the HF model cannot be downloaded on first run,
the app automatically falls back to an offline hashing-based embedding backend so it does not crash.

For best retrieval quality, install:

```bash
pip install sentence-transformers
```
